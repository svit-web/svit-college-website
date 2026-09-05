/**
 * Build-time search index generator — see docs/design/SEARCH_PLAN.md.
 *
 * Builds entries directly from Supabase content (no live-server HTML crawl —
 * that approach couldn't run inside Vercel's build step, since Vercel's build
 * sandbox doesn't produce a self-hostable server to crawl; see the standalone
 * output being disabled on Vercel in next.config.ts). Static informational
 * pages get curated title/description below instead of scraped metadata.
 *
 * Runs automatically as part of `pnpm run build` (chained explicitly, not via
 * an npm postbuild lifecycle hook, so it doesn't depend on pnpm's pre/post
 * script support being enabled in Vercel's build image). Any error here
 * propagates and fails the whole build on purpose — a broken index should
 * block deploys, not degrade silently.
 *
 * Usage: pnpm run search:index (local) — same command runs during `build`.
 */
import { writeFile } from "node:fs/promises";
import path from "node:path";

// Loads local .env for `pnpm run search:index` outside `next build` (which
// loads it internally). No-ops on Vercel, where env vars are already in
// process.env and no .env file is deployed.
try {
  process.loadEnvFile(".env");
} catch {
  // missing file (e.g. on Vercel) — process.env is already populated there
}

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

const OUTPUT_PATH = path.join(process.cwd(), "public", "search-index.json");

// Static, DB-independent informational pages, curated by hand since there's
// no live page to crawl for their title/description. Routes that aren't
// real "content" a search result should land on — forms, auth,
// redirect-only pages like /placement/[college] and
// /courses/engineering/[dept] (superseded by /departments/[dept]) — are
// deliberately left out, same as before.
const STATIC_ENTRIES: SearchEntry[] = [
  {
    url: "/",
    type: "Page",
    college: null,
    title: "Home",
    description: "SVIT Vasad — Sardar Vallabhbhai Institute of Technology.",
  },
  {
    url: "/about",
    type: "Page",
    college: null,
    title: "About SVIT Vasad",
    description: "Legacy, vision, leadership and campus overview.",
  },
  {
    url: "/about/accreditation",
    type: "Page",
    college: null,
    title: "Accreditation & Compliance",
    description:
      "Accreditations, approvals, academic regulations, mandatory disclosures and industry MOUs.",
  },
  {
    url: "/about/board-of-management",
    type: "Page",
    college: null,
    title: "Board of Management",
    description: "SVIT Vasad's governing board and management committee.",
  },
  {
    url: "/about/chairman-message",
    type: "Page",
    college: null,
    title: "Chairman's Message",
    description: "A message from the chairman of SVIT Vasad.",
  },
  {
    url: "/about/committees",
    type: "Page",
    college: null,
    title: "Committees",
    description: "Institutional committees at SVIT Vasad.",
  },
  {
    url: "/about/facilities",
    type: "Page",
    college: null,
    title: "Facilities",
    description: "Campus facilities and infrastructure at SVIT Vasad.",
  },
  {
    url: "/about/history-vision-mission",
    type: "Page",
    college: null,
    title: "History, Vision & Mission",
    description: "SVIT Vasad's history, vision and mission since 1997.",
  },
  {
    url: "/about/media",
    type: "Page",
    college: null,
    title: "Media",
    description: "News coverage and media mentions of SVIT Vasad.",
  },
  {
    url: "/about/principal-message",
    type: "Page",
    college: null,
    title: "Principal's Message",
    description: "A message from the principal of SVIT Vasad.",
  },
  {
    url: "/admissions",
    type: "Page",
    college: null,
    title: "Admissions",
    description: "Admission process, eligibility and intake information.",
  },
  {
    url: "/admissions/intake-fees",
    type: "Page",
    college: null,
    title: "Intake & Fees",
    description: "Programme intake capacity and fee structure.",
  },
  {
    url: "/admissions/scholarships",
    type: "Page",
    college: null,
    title: "Scholarships",
    description: "Scholarship schemes available to students.",
  },
  {
    url: "/alumni",
    type: "Page",
    college: null,
    title: "Alumni",
    description: "SVIT Vasad's alumni network.",
  },
  {
    url: "/anti-ragging",
    type: "Page",
    college: null,
    title: "Anti-Ragging",
    description: "Anti-ragging policy and helpline information.",
  },
  {
    url: "/campus",
    type: "Page",
    college: null,
    title: "Campus",
    description: "SVIT Vasad's 15-acre campus.",
  },
  {
    url: "/campus-life",
    type: "Page",
    college: null,
    title: "Campus Life",
    description: "Student life, clubs, events and facilities.",
  },
  {
    url: "/campus-life/clubs",
    type: "Page",
    college: null,
    title: "Student Clubs",
    description: "Student clubs and societies at SVIT Vasad.",
  },
  {
    url: "/campus-life/events",
    type: "Page",
    college: null,
    title: "Events",
    description: "Campus events and activities.",
  },
  {
    url: "/campus-life/facilities",
    type: "Page",
    college: null,
    title: "Campus Facilities",
    description: "Facilities available to students on campus.",
  },
  {
    url: "/careers",
    type: "Page",
    college: null,
    title: "Careers",
    description: "Career opportunities at SVIT Vasad.",
  },
  {
    url: "/colleges",
    type: "Page",
    college: null,
    title: "Colleges",
    description: "Institutes under SVIT Vasad.",
  },
  {
    url: "/courses",
    type: "Page",
    college: null,
    title: "Courses",
    description: "Programmes offered at SVIT Vasad.",
  },
  {
    url: "/downloads",
    type: "Page",
    college: null,
    title: "Downloads",
    description: "Downloadable forms, circulars and documents.",
  },
  {
    url: "/gallery",
    type: "Page",
    college: null,
    title: "Gallery",
    description: "Photo and video gallery.",
  },
  {
    url: "/grievance",
    type: "Page",
    college: null,
    title: "Grievance",
    description: "Student grievance redressal.",
  },
  {
    url: "/news",
    type: "Page",
    college: null,
    title: "News",
    description: "Latest news and announcements.",
  },
  {
    url: "/parents",
    type: "Page",
    college: null,
    title: "Parents",
    description: "Information for parents.",
  },
  {
    url: "/placement",
    type: "Page",
    college: null,
    title: "Placement",
    description: "Placement cell and recruitment activities.",
  },
  {
    url: "/student-corner",
    type: "Page",
    college: null,
    title: "Student Corner",
    description: "Centers and resources for students.",
  },
];

async function getStaffEntries(
  collegeNameByDeptId: Map<string, string | null>,
): Promise<SearchEntry[]> {
  const supabase = publicSupabase();

  interface StaffRow {
    id: string;
    employee_code: string | null;
    title: string | null;
    first_name: string;
    last_name: string;
    designation: string | null;
  }
  interface AssignmentRow {
    staff_id: string;
    department_id: string | null;
  }

  const staffResult = await supabase
    .from("staff_profiles")
    .select("id, employee_code, title, first_name, last_name, designation")
    .eq("status", "published")
    .not("employee_code", "is", null);
  if (staffResult.error || !staffResult.data) {
    throw new Error(`[search-index] staff query failed: ${staffResult.error?.message}`);
  }
  const staff = staffResult.data as StaffRow[];

  const assignmentResult = await supabase
    .from("staff_department_assignments")
    .select("staff_id, department_id")
    .eq("is_primary", true)
    .eq("status", "published");
  if (assignmentResult.error) {
    throw new Error(
      `[search-index] staff department assignment query failed: ${assignmentResult.error.message}`,
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
      type: "Staff" as const,
      college: collegeNameByDeptId.get(deptIdByStaffId.get(s.id) ?? "") ?? null,
      title: [s.title, s.first_name, s.last_name].filter(Boolean).join(" "),
      description: s.designation ?? "",
    }));
}

async function buildContentEntries(): Promise<SearchEntry[]> {
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
    getAllColleges(),
    getAllDepartments(),
    getAllProgrammes(),
    getAllGalleryAlbums(),
    getAllStudentClubs(),
    getAllEvents(),
    getAllCenters(),
    getAllFacilities(),
  ]);

  const collegeNameBySlug = new Map(colleges.map((c) => [c.slug, c.name] as const));
  const collegeNameByDeptId = new Map(
    departments.map((d) => [d.id, collegeNameBySlug.get(d.college_slug) ?? null] as const),
  );

  const entries: SearchEntry[] = [];

  for (const c of colleges) {
    // college: null, not c.name — for every other type, `college` names a
    // *different* owning entity (a department's college, a staff member's
    // college), which is useful context. For a College entry itself it would
    // just repeat the title as a redundant second line.
    entries.push({
      url: `/colleges/${c.slug}`,
      type: "College",
      college: null,
      title: c.name,
      description: c.tagline ?? "",
    });
  }
  for (const d of departments) {
    entries.push({
      url: `/departments/${d.code}`,
      type: "Department",
      college: collegeNameBySlug.get(d.college_slug) ?? null,
      title: d.name,
      description: d.overview ?? "",
    });
  }
  for (const p of programmes) {
    entries.push({
      url: `/courses/${p.code}`,
      type: "Course",
      college: null,
      title: p.name,
      description: p.description ?? "",
    });
  }
  for (const a of albums) {
    entries.push({
      url: `/gallery/${a.id}`,
      type: "Gallery",
      college: null,
      title: a.title,
      description: a.description ?? "",
    });
  }
  for (const c of clubs) {
    entries.push({
      url: `/campus-life/clubs/${c.slug}`,
      type: "Club",
      college: null,
      title: c.name,
      description: c.description ?? "",
    });
  }
  for (const e of events) {
    entries.push({
      url: `/campus-life/events/${e.slug}`,
      type: "Event",
      college: null,
      title: e.title,
      description: e.description ?? "",
    });
  }
  for (const c of centers) {
    entries.push({
      url: `/student-corner/${c.slug}`,
      type: "Centre",
      college: null,
      title: c.name,
      description: c.description ?? "",
    });
  }
  for (const f of facilities) {
    entries.push({
      url: `/campus-life/facilities/${f.category ?? "academic"}/${f.slug}`,
      type: "Facility",
      college: null,
      title: f.name,
      description: f.description ?? "",
    });
  }

  entries.push(...(await getStaffEntries(collegeNameByDeptId)));

  return entries;
}

async function main() {
  console.log("[search-index] fetching content from Supabase...");
  const contentEntries = await buildContentEntries();

  // De-dupe: a handful of entities can legitimately resolve to the same URL
  // (e.g. two draft rows sharing a slug during content editing).
  const seen = new Set<string>();
  const entries = [...STATIC_ENTRIES, ...contentEntries]
    .filter((e) => !!e.title)
    .filter((e) => (seen.has(e.url) ? false : (seen.add(e.url), true)));

  await writeFile(OUTPUT_PATH, JSON.stringify(entries), "utf-8");
  console.log(`[search-index] wrote ${entries.length} entries to ${OUTPUT_PATH}`);
}

main().catch((err) => {
  console.error("[search-index] failed:", err);
  process.exit(1);
});
