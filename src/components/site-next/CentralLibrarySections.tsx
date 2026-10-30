import { ArrowUpRight, Clock, Mail, Phone, BookOpen, FileDown } from "lucide-react";
import { StaffCard } from "@/components/site-next/DepartmentSections";
import { SectionHeading } from "@/components/site-next/SectionHeading";
import { Reveal } from "@/components/site-next/Reveal";
import type {
  LibraryPageData,
  LibraryResource,
  LibraryResourceCategory,
} from "@/lib/library.functions";

const CATEGORY_LABELS: Record<LibraryResourceCategory, string> = {
  e_journal: "E-journals",
  database: "Databases",
  digital_library: "Digital libraries",
  other: "Other resources",
  // Rendered as buttons above the grid, not as a group.
  opac: "Catalogue",
  remote_access: "Remote access",
};
// Admin-entered links: only render http(s) ones (never javascript: etc.).
function safeHref(url: string | null): string | null {
  return url && /^https?:\/\//i.test(url.trim()) ? url.trim() : null;
}

const GROUP_ORDER: LibraryResourceCategory[] = [
  "e_journal",
  "database",
  "digital_library",
  "other",
];

/**
 * The Central Library sections below the shared Detail layout heading. Every
 * section is driven by Supabase (facility metadata + library_* tables) and is
 * omitted when it has no published rows.
 */
export function CentralLibrarySections({ data }: { data: LibraryPageData }) {
  const { facility, holdings, resources, info, staff, downloads } = data;
  const highlights = facility.metadata?.highlights ?? [];
  const totalBooks = holdings.reduce((sum, h) => sum + (h.bookCount || 0), 0);
  const quickLinks = resources.filter(
    (r) => (r.category === "opac" || r.category === "remote_access") && safeHref(r.website_url),
  );
  const groups = GROUP_ORDER.map((category) => ({
    category,
    items: resources.filter((r) => r.category === category),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="space-y-14">
      {(info.stat.length > 0 || totalBooks > 0) && (
        <div className="grid grid-cols-2 gap-px border border-line bg-line sm:grid-cols-4">
          {info.stat.map((s) => (
            <Stat key={s.id} value={s.value ?? ""} label={s.title} />
          ))}
          {totalBooks > 0 && (
            <Stat value={totalBooks.toLocaleString("en-IN")} label="Books across colleges" />
          )}
        </div>
      )}

      {quickLinks.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {quickLinks.map((r) => (
            <a
              key={r.id}
              href={safeHref(r.website_url)!}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-navy px-5 py-3 text-sm font-semibold text-paper transition-colors hover:bg-crimson"
            >
              {r.name} <ArrowUpRight className="h-4 w-4" />
            </a>
          ))}
        </div>
      )}

      {highlights.length > 0 && (
        <div>
          <SectionHeading eyebrow="Highlights" title="What makes it special" variant="eyebrow" />
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {highlights.map((h, i) => (
              <Reveal key={h.title} delay={i * 0.04}>
                <div className="h-full border border-line bg-surface p-5">
                  <div className="font-display font-medium text-navy">{h.title}</div>
                  <p className="mt-1 text-sm text-ink-soft">{h.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      )}

      {holdings.length > 1 && (
        <div>
          <SectionHeading eyebrow="Collection" title="Books by college" variant="eyebrow" />
          <ul className="mt-6 divide-y divide-line border border-line bg-surface">
            {holdings.map((h) => (
              <li key={h.collegeId} className="flex items-center justify-between gap-4 px-5 py-3">
                <span className="text-sm text-navy">{h.collegeName}</span>
                <span className="font-display text-lg text-navy">
                  {h.bookCount.toLocaleString("en-IN")}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {info.timing.length > 0 && (
        <div>
          <SectionHeading eyebrow="Visit" title="Library timings" variant="eyebrow" />
          <ul className="mt-6 divide-y divide-line border border-line bg-surface">
            {info.timing.map((t) => (
              <li
                key={t.id}
                className="flex flex-wrap items-start justify-between gap-x-6 gap-y-1 px-5 py-3"
              >
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-navy">
                    <Clock className="h-4 w-4 text-crimson" /> {t.title}
                  </div>
                  {t.description && <p className="mt-1 text-xs text-ink-soft">{t.description}</p>}
                </div>
                {t.value && <span className="text-sm text-navy">{t.value}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {groups.length > 0 && (
        <div>
          <SectionHeading eyebrow="Digital access" title="E-resources" variant="eyebrow" />
          <div className="mt-6 space-y-8">
            {groups.map((g) => (
              <div key={g.category}>
                {groups.length > 1 && (
                  <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.15em] text-ink-soft">
                    {CATEGORY_LABELS[g.category]}
                  </h3>
                )}
                <div className="grid gap-4 sm:grid-cols-2">
                  {g.items.map((r, i) => (
                    <Reveal key={r.id} delay={i * 0.03}>
                      <ResourceCard resource={r} />
                    </Reveal>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {info.service.length > 0 && (
        <div>
          <SectionHeading eyebrow="Services" title="What the library offers" variant="eyebrow" />
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {info.service.map((s, i) => (
              <Reveal key={s.id} delay={i * 0.04}>
                <div className="h-full border border-line bg-surface p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="font-display font-medium text-navy">{s.title}</div>
                    {s.value && (
                      <span className="shrink-0 text-xs font-semibold text-crimson">{s.value}</span>
                    )}
                  </div>
                  {s.description && (
                    <p className="mt-1 whitespace-pre-line text-sm text-ink-soft">
                      {s.description}
                    </p>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      )}

      {info.rule.length > 0 && (
        <div>
          <SectionHeading eyebrow="Guidelines" title="Rules & code of conduct" variant="eyebrow" />
          <ol className="mt-6 space-y-3">
            {info.rule.map((r, i) => (
              <li key={r.id} className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-paper-deep text-xs font-bold text-navy">
                  {i + 1}
                </span>
                <div className="pt-0.5">
                  <div className="text-sm font-semibold text-navy">
                    {r.title}
                    {r.value && <span className="ml-2 font-normal text-ink-soft">{r.value}</span>}
                  </div>
                  {r.description && (
                    <p className="mt-1 whitespace-pre-line text-sm text-ink-soft">
                      {r.description}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}

      {staff.length > 0 && (
        <div>
          <SectionHeading eyebrow="People" title="Library team" variant="eyebrow" />
          {/* minmax(0,1fr): truncated emails must not widen the track past the screen. */}
          <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-4 sm:grid-cols-2">
            {staff.map((m, i) => (
              <Reveal key={m.id} delay={i * 0.03}>
                <StaffCard member={m} />
              </Reveal>
            ))}
          </div>
        </div>
      )}

      {downloads.length > 0 && (
        <div>
          <SectionHeading eyebrow="Downloads" title="Forms & documents" variant="eyebrow" />
          <ul className="mt-6 divide-y divide-line border border-line bg-surface">
            {downloads.map((d) => (
              <li key={d.id}>
                <a
                  href={d.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-4 px-5 py-3 text-sm text-navy transition-colors hover:bg-paper-deep hover:text-crimson"
                >
                  <span className="flex items-center gap-3">
                    <FileDown className="h-4 w-4 shrink-0 text-crimson" /> {d.title}
                  </span>
                  {d.file_type && (
                    <span className="text-xs font-semibold uppercase text-ink-soft">
                      {d.file_type}
                    </span>
                  )}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {info.contact.length > 0 && (
        <div>
          <SectionHeading eyebrow="Get in touch" title="Contact the library" variant="eyebrow" />
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {info.contact.map((c) => (
              <li key={c.id} className="border border-line bg-surface p-5">
                <div className="text-xs font-bold uppercase tracking-[0.15em] text-ink-soft">
                  {c.title}
                </div>
                {c.value && <ContactValue value={c.value} />}
                {c.description && <p className="mt-1 text-sm text-ink-soft">{c.description}</p>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="bg-surface p-5">
      <div className="font-display text-3xl text-navy">{value}</div>
      <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-ink-soft">
        {label}
      </div>
    </div>
  );
}

function ResourceCard({ resource: r }: { resource: LibraryResource }) {
  const href = safeHref(r.website_url);
  const body = (
    <div className="flex h-full items-start gap-4 border border-line bg-surface p-5 transition-colors group-hover:border-crimson">
      {r.logo_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={r.logo_url} alt="" className="h-10 w-10 shrink-0 object-contain" />
      ) : (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-paper-deep text-navy">
          <BookOpen className="h-5 w-5" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="font-display font-medium text-navy group-hover:text-crimson">
            {r.name}
          </div>
          {href && <ArrowUpRight className="h-4 w-4 shrink-0 text-ink-soft" />}
        </div>
        {r.publisher && <div className="text-xs text-ink-soft">{r.publisher}</div>}
        {r.description && <p className="mt-2 text-sm text-ink-soft">{r.description}</p>}
        {r.access_note && <p className="mt-2 text-xs italic text-ink-soft">{r.access_note}</p>}
      </div>
    </div>
  );
  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className="group block h-full">
      {body}
    </a>
  ) : (
    body
  );
}

// Contact values are free text; make the common shapes clickable.
function ContactValue({ value }: { value: string }) {
  const v = value.trim();
  if (/^\S+@\S+\.\S+$/.test(v)) {
    return (
      <a
        href={`mailto:${v}`}
        className="mt-1 flex items-center gap-2 text-sm font-semibold text-navy hover:text-crimson"
      >
        <Mail className="h-4 w-4 text-crimson" /> {v}
      </a>
    );
  }
  if (/^\+?[\d\s()-]{7,}$/.test(v)) {
    return (
      <a
        href={`tel:${v.replace(/[^\d+]/g, "")}`}
        className="mt-1 flex items-center gap-2 text-sm font-semibold text-navy hover:text-crimson"
      >
        <Phone className="h-4 w-4 text-crimson" /> {v}
      </a>
    );
  }
  return <div className="mt-1 whitespace-pre-line text-sm font-semibold text-navy">{v}</div>;
}
