#!/usr/bin/env bun
/**
 * Build-time search index generator — see docs/design/SEARCH_PLAN.md.
 *
 * Crawls the site's own rendered HTML (title, h1-h4 headings scoped to
 * <main>, meta description) for every canonical content URL and writes
 * public/search-index.json. The client-side search UI does fuzzy matching
 * (Fuse.js) against that file — no database query happens per keystroke,
 * and this script never touches tsvector/pgvector.
 *
 * This project has no SSG (next.config.ts sets `output: "standalone"`, no
 * route uses generateStaticParams), so there's nothing to read out of the
 * build output — this must run against a LIVE instance of the app. Point it
 * at one with SEARCH_CRAWL_BASE_URL (defaults to http://localhost:3000).
 *
 * Usage: bun run scripts/build-search-index.ts
 */
import * as cheerio from "cheerio";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { publicSupabase } from "../src/lib/supabase-public";
import { getAllColleges, type College } from "../src/lib/colleges.functions";
import { getAllDepartments, type Department } from "../src/lib/departments.functions";
import { getAllProgrammes, type Programme } from "../src/lib/programmes.functions";
import { getAllGalleryAlbums, type GalleryAlbum } from "../src/lib/gallery.functions";
import { getAllStudentClubs, type StudentClub } from "../src/lib/clubs.functions";
import { getAllEvents, type CampusEvent } from "../src/lib/events.functions";
import { getAllCenters, type Center } from "../src/lib/centers.functions";
import { getAllFacilities, type Facility } from "../src/lib/facilities.functions";
import type { SearchEntry } from "../src/lib/search-index";

/** Resolves to [] instead of rejecting — one broken content type shouldn't fail the whole crawl. */
async function safeFetch<T>(promise: Promise<T[]>): Promise<T[]> {
  try {
    return await promise;
  } catch (err) {
    console.warn(`[search-index] a content query failed, skipping it: ${(err as Error).message}`);
    return [];
  }
}

const BASE_URL = (process.env.SEARCH_CRAWL_BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");
const CONCURRENCY = 8;
const OUTPUT_PATH = path.join(process.cwd(), "public", "search-index.json");

type CrawlTarget = Pick<SearchEntry, "url" | "type" | "college">;

// Static, DB-independent informational pages. Curated rather than walked
// from src/app/(site) at runtime, so routes that aren't real "content" a
// search result should land on — forms, auth, redirect-only pages like
// /placement/[college] and /courses/engineering/[dept] (superseded by
// /departments/[dept]) — are deliberately left out.
const STATIC_ROUTES: CrawlTarget[] = [
  { url: "/", type: "Page", college: null },
  { url: "/about", type: "Page", college: null },
  { url: "/about/accreditation", type: "Page", college: null },
  { url: "/about/board-of-management", type: "Page", college: null },
  { url: "/about/chairman-message", type: "Page", college: null },
  { url: "/about/committees", type: "Page", college: null },
  { url: "/about/facilities", type: "Page", college: null },
  { url: "/about/history-vision-mission", type: "Page", college: null },
  { url: "/about/media", type: "Page", college: null },
  { url: "/admissions", type: "Page", college: null },
  { url: "/admissions/intake-fees", type: "Page", college: null },
  { url: "/admissions/scholarships", type: "Page", college: null },
  { url: "/alumni", type: "Page", college: null },
  { url: "/anti-ragging", type: "Page", college: null },
  { url: "/campus", type: "Page", college: null },
  { url: "/campus-life", type: "Page", college: null },
  { url: "/campus-life/clubs", type: "Page", college: null },
  { url: "/campus-life/events", type: "Page", college: null },
  { url: "/campus-life/facilities", type: "Page", college: null },
  { url: "/careers", type: "Page", college: null },
  { url: "/colleges", type: "Page", college: null },
  { url: "/courses", type: "Page", college: null },
  { url: "/downloads", type: "Page", college: null },
  { url: "/gallery", type: "Page", college: null },
  { url: "/grievance", type: "Page", college: null },
  { url: "/news", type: "Page", college: null },
  { url: "/parents", type: "Page", college: null },
  { url: "/placement", type: "Page", college: null },
  { url: "/student-corner", type: "Page", college: null },
];

/**
 * Committees are already individually crawlable — about/committees/page.tsx
 * renders each one as a real <h3>. Board members get the same treatment via
 * a one-line markup fix (see about/board-of-management/page.tsx). But
 * accreditations, MOUs, and individual downloads render inside <table>
 * cells / <span>s, not headings, and have no dedicated detail URL — a
 * tag-only crawl can only index their shared listing page as a whole.
 * Accepted trade-off (small counts: single digits each) rather than fixed —
 * see docs/design/SEARCH_PLAN.md.
 */

async function getStaffTargets(
  collegeNameByDeptId: Map<string, string | null>,
): Promise<CrawlTarget[]> {
  const supabase = publicSupabase();

  interface StaffRow {
    id: string;
    employee_code: string | null;
  }
  interface AssignmentRow {
    staff_id: string;
    department_id: string | null;
  }

  const staffResult = await supabase
    .from("staff_profiles")
    .select("id, employee_code")
    .eq("status", "published")
    .not("employee_code", "is", null);
  if (staffResult.error || !staffResult.data) {
    console.warn("[search-index] staff query failed, skipping staff:", staffResult.error?.message);
    return [];
  }
  const staff = staffResult.data as StaffRow[];

  const assignmentResult = await supabase
    .from("staff_department_assignments")
    .select("staff_id, department_id")
    .eq("is_primary", true)
    .eq("status", "published");
  if (assignmentResult.error) {
    console.warn(
      "[search-index] staff department assignment query failed:",
      assignmentResult.error.message,
    );
  }
  const assignments = (assignmentResult.data ?? []) as AssignmentRow[];

  const deptIdByStaffId = new Map<string, string>(
    assignments
      .filter((a): a is AssignmentRow & { department_id: string } => !!a.department_id)
      .map((a) => [a.staff_id, a.department_id]),
  );

  return staff
    .filter((s): s is StaffRow & { employee_code: string } => !!s.employee_code)
    .map((s) => ({
      url: `/staff/${s.employee_code}`,
      type: "Staff",
      college: collegeNameByDeptId.get(deptIdByStaffId.get(s.id) ?? "") ?? null,
    }));
}

async function buildCrawlTargets(): Promise<CrawlTarget[]> {
  const [colleges, departments, programmes, albums, clubs, events, centers, facilities]: [
    College[],
    Department[],
    Programme[],
    GalleryAlbum[],
    StudentClub[],
    CampusEvent[],
    Center[],
    Facility[],
  ] = await Promise.all([
    safeFetch<College>(getAllColleges()),
    safeFetch<Department>(getAllDepartments()),
    safeFetch<Programme>(getAllProgrammes()),
    safeFetch<GalleryAlbum>(getAllGalleryAlbums()),
    safeFetch<StudentClub>(getAllStudentClubs()),
    safeFetch<CampusEvent>(getAllEvents()),
    safeFetch<Center>(getAllCenters()),
    safeFetch<Facility>(getAllFacilities()),
  ]);

  const collegeNameBySlug = new Map(colleges.map((c) => [c.slug, c.name] as const));
  const collegeNameByDeptId = new Map(
    departments.map((d) => [d.id, collegeNameBySlug.get(d.college_slug) ?? null] as const),
  );

  const targets: CrawlTarget[] = [...STATIC_ROUTES];

  for (const c of colleges) {
    // college: null, not c.name — for every other type, `college` names a
    // *different* owning entity (a department's college, a staff member's
    // college), which is useful context. For a College entry itself it would
    // just repeat the title as a redundant second line.
    targets.push({ url: `/colleges/${c.slug}`, type: "College", college: null });
  }
  for (const d of departments) {
    targets.push({
      url: `/departments/${d.code}`,
      type: "Department",
      college: collegeNameBySlug.get(d.college_slug) ?? null,
    });
  }
  for (const p of programmes) {
    targets.push({ url: `/courses/${p.code}`, type: "Course", college: null });
  }
  for (const a of albums) {
    targets.push({ url: `/gallery/${a.id}`, type: "Gallery", college: null });
  }
  for (const c of clubs) {
    targets.push({ url: `/campus-life/clubs/${c.slug}`, type: "Club", college: null });
  }
  for (const e of events) {
    targets.push({ url: `/campus-life/events/${e.slug}`, type: "Event", college: null });
  }
  for (const c of centers) {
    targets.push({ url: `/student-corner/${c.slug}`, type: "Centre", college: null });
  }
  for (const f of facilities) {
    targets.push({
      url: `/campus-life/facilities/${f.category ?? "academic"}/${f.slug}`,
      type: "Facility",
      college: null,
    });
  }

  targets.push(...(await getStaffTargets(collegeNameByDeptId)));

  // De-dupe: a handful of entities can legitimately resolve to the same URL
  // (e.g. two draft rows sharing a slug during content editing).
  const seen = new Set<string>();
  return targets.filter((t) => (seen.has(t.url) ? false : (seen.add(t.url), true)));
}

async function waitForServer(url: string, timeoutMs = 60_000): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      // Per-attempt timeout so one hung request can't eat the whole budget
      // in a single try — it needs to actually retry, not just wait once.
      const res = await fetch(url, { signal: AbortSignal.timeout(5_000) });
      if (res.status < 500) return; // server is up and routing, even a 404 is fine here
    } catch {
      // not up yet
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  throw new Error(`[search-index] server at ${url} did not become ready within ${timeoutMs}ms`);
}

async function fetchPageMeta(
  url: string,
): Promise<{ title: string; description: string; headings: string } | null> {
  let res: Response;
  try {
    // Without a timeout, one hung Server Component (e.g. a slow Supabase
    // query on that page) stalls a concurrency worker indefinitely instead
    // of just failing that one URL.
    res = await fetch(`${BASE_URL}${url}`, {
      headers: { "user-agent": "svit-search-indexer" },
      signal: AbortSignal.timeout(15_000),
    });
  } catch (err) {
    console.warn(`[search-index] skip ${url} — fetch failed: ${(err as Error).message}`);
    return null;
  }
  if (!res.ok) {
    console.warn(`[search-index] skip ${url} — HTTP ${res.status}`);
    return null;
  }

  const html = await res.text();
  const $ = cheerio.load(html);
  const title = $("title").first().text().trim();
  const description = $('meta[name="description"]').attr("content")?.trim() ?? "";
  // Scoped to <main> — every page shares the same Header/Footer chrome
  // ("Quick Links", "Courses", "Important", …), which would otherwise
  // pollute every single entry's headings with identical noise.
  const headings = $("main h1, main h2, main h3, main h4")
    .map((_, el) => $(el).text().trim())
    .get()
    .filter(Boolean)
    .join(" · ");

  return { title, description, headings };
}

async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;
  async function worker() {
    while (cursor < items.length) {
      const current = cursor++;
      results[current] = await fn(items[current], current);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => worker()));
  return results;
}

async function main() {
  console.log(`[search-index] waiting for ${BASE_URL} ...`);
  await waitForServer(BASE_URL);

  console.log("[search-index] resolving crawl targets from Supabase...");
  const targets = await buildCrawlTargets();
  console.log(`[search-index] crawling ${targets.length} URLs (concurrency ${CONCURRENCY})...`);

  const entries = (
    await mapWithConcurrency(targets, CONCURRENCY, async (target) => {
      const meta = await fetchPageMeta(target.url);
      if (!meta || !meta.title) return null;
      const entry: SearchEntry = { ...target, ...meta };
      return entry;
    })
  ).filter((e): e is SearchEntry => e !== null);

  await writeFile(OUTPUT_PATH, JSON.stringify(entries), "utf-8");
  console.log(`[search-index] wrote ${entries.length}/${targets.length} entries to ${OUTPUT_PATH}`);
}

main().catch((err) => {
  console.error("[search-index] failed:", err);
  process.exit(1);
});
