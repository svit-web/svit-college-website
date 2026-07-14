// Extra metadata for programs shown in department pages (intake, duration, etc).
// Keyed by program id from `academics.ts`. Sensible defaults are returned for
// programs missing an entry so the template renders without hand-editing every row.

export type DegreeLevel = "UG" | "PG" | "Diploma";

export interface ProgramDetail {
  degreeLevel: DegreeLevel;
  yearStarted: number | null;
  intake: number | null;
  durationYears: number | null;
}

const DEFAULT_BE: ProgramDetail = { degreeLevel: "UG", yearStarted: 2005, intake: 60, durationYears: 4 };
const DEFAULT_ME: ProgramDetail = { degreeLevel: "PG", yearStarted: 2010, intake: 18, durationYears: 2 };
const DEFAULT_DIP: ProgramDetail = { degreeLevel: "Diploma", yearStarted: 2011, intake: 60, durationYears: 3 };

export const programDetails: Record<string, ProgramDetail> = {
  // SVIT · BE
  "prog-svit-be-aeronautical": { ...DEFAULT_BE, yearStarted: 2008 },
  "prog-svit-be-mechanical": DEFAULT_BE,
  "prog-svit-be-electrical": DEFAULT_BE,
  "prog-svit-be-civil": DEFAULT_BE,
  "prog-svit-be-computer": DEFAULT_BE,
  "prog-svit-be-csd": { ...DEFAULT_BE, yearStarted: 2022, intake: 60 },
  "prog-svit-be-it": DEFAULT_BE,
  "prog-svit-be-ec": DEFAULT_BE,
  // SVIT · ME
  "prog-svit-me-software": DEFAULT_ME,
  "prog-svit-me-structure": DEFAULT_ME,
  // SVIT · Diploma
  "prog-svit-dip-computer": DEFAULT_DIP,
  "prog-svit-dip-it": DEFAULT_DIP,
  "prog-svit-dip-electrical": DEFAULT_DIP,
  "prog-svit-dip-mechanical": DEFAULT_DIP,
  "prog-svit-dip-civil": DEFAULT_DIP,
  // SVIT · MBA / MCA
  "prog-svit-mba": { degreeLevel: "PG", yearStarted: 2009, intake: 60, durationYears: 2 },
  "prog-svit-mca": { degreeLevel: "PG", yearStarted: 2020, intake: 60, durationYears: 2 },
  // SVION
  "prog-svion-gnm": { degreeLevel: "Diploma", yearStarted: 2012, intake: 60, durationYears: 3 },
  // COA
  "prog-coa-barch": { degreeLevel: "UG", yearStarted: 2014, intake: 40, durationYears: 5 },
  "prog-coa-bid": { degreeLevel: "UG", yearStarted: 2018, intake: 30, durationYears: 4 },
  "prog-coa-diparch": { degreeLevel: "Diploma", yearStarted: 2016, intake: 30, durationYears: 3 },
  // SVICA
  "prog-svica-bca": { degreeLevel: "UG", yearStarted: 2010, intake: 60, durationYears: 3 },
  "prog-svica-bsc-it": { degreeLevel: "UG", yearStarted: 2015, intake: 60, durationYears: 3 },
};

export function getProgramDetail(programId: string): ProgramDetail {
  return programDetails[programId] ?? { degreeLevel: "UG", yearStarted: null, intake: null, durationYears: null };
}
