// Per-department editorial content: about text, program-table metadata,
// achievements, clubs, and activities. Everything is keyed by `departmentId`
// so a future CMS/API can replace this file without touching components.
// Missing entries fall back to safe defaults in `getDepartmentContent`.

export type DegreeLevel = "UG" | "PG" | "Diploma";

export interface ProgramRow {
  programId: string;         // links to academics.ts `programs[].id`
  degreeLevel: DegreeLevel;
  yearStarted: number | null;
  intake: number | null;
  duration: string;          // "4 Years", "2 Years", etc.
}

export interface AchievementItem {
  id: string;
  title: string;
  description: string;
  date: string;              // ISO YYYY-MM-DD
  image: string | null;
}

export interface ClubItem {
  id: string;
  name: string;
  description: string;
  icon: string | null;
}

export type ActivityType =
  | "sttp_fdp"
  | "expert_lecture"
  | "seminar_workshop"
  | "mou"
  | "industry_visit";

export interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  startDate: string;         // ISO
  endDate?: string | null;
  documentUrl?: string | null;
  notes?: string | null;
  company?: string | null;   // for MOU / industry visit
}

export interface DepartmentContent {
  about: string;
  vision: string | null;
  mission: string | null;
  programTable: ProgramRow[];
  achievements: AchievementItem[];
  clubs: ClubItem[];
  activities: ActivityItem[];
}

// -----------------------------------------------------------------------------
// Seed content. Fields left empty render as neutral placeholders in the UI.
// TODO: replace program table numbers (yearStarted / intake) with authoritative
// data from the institute.
// -----------------------------------------------------------------------------

const DEFAULT_ABOUT =
  "The department is committed to academic excellence, industry-aligned learning and holistic student development. Our curriculum blends strong fundamentals with hands-on lab work, projects, and mentorship from experienced faculty.";

const DEGREE_LEVEL_BY_TYPE: Record<string, DegreeLevel> = {
  "svit-be": "UG",
  "svit-me": "PG",
  "svit-diploma": "Diploma",
  "svit-mba": "PG",
  "svit-mca": "PG",
};

// Duration defaults by degree level.
const DURATION_BY_LEVEL: Record<DegreeLevel, string> = {
  UG: "4 Years",
  PG: "2 Years",
  Diploma: "3 Years",
};

// Departments where every entry is a placeholder — the object exists so admins
// see the shape they can extend later.
const CONTENT: Partial<Record<string, Partial<DepartmentContent>>> = {
  "dept-svit-be-it": {
    about:
      "The Department of Information Technology at SVIT was established with a vision to nurture skilled IT professionals ready to meet global industry demands. The department offers a strong foundation in programming, systems, networks, data engineering and emerging technologies through modern labs and industry partnerships.",
    vision:
      "To be a centre of excellence in Information Technology education and research, producing globally competent professionals.",
    mission:
      "Deliver industry-aligned curriculum, promote experiential learning, and foster ethical and innovative IT leaders.",
  },
};

export function getDepartmentContent(
  departmentId: string,
  programs: { id: string; name: string }[],
  degreeTypeId: string | null,
): DepartmentContent {
  const base = CONTENT[departmentId] ?? {};
  const level: DegreeLevel = degreeTypeId
    ? (DEGREE_LEVEL_BY_TYPE[degreeTypeId] ?? "UG")
    : "UG";
  return {
    about: base.about ?? DEFAULT_ABOUT,
    vision: base.vision ?? null,
    mission: base.mission ?? null,
    programTable:
      base.programTable ??
      programs.map((p) => ({
        programId: p.id,
        degreeLevel: level,
        yearStarted: null, // TODO: fill from institute records
        intake: null,      // TODO: fill from institute records
        duration: DURATION_BY_LEVEL[level],
      })),
    achievements: base.achievements ?? [],
    clubs: base.clubs ?? [],
    activities: base.activities ?? [],
  };
}
