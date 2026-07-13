// College metadata for the SVIT Group umbrella site.
// Program/department/degree-type data lives in `./academics.ts` and is looked
// up by CollegeSlug so this file stays a thin metadata layer that a CMS can
// replace later.
import svitLogo from "@/assets/svit-logo.jpg.asset.json";
import svicaLogo from "@/assets/svica-logo.jpg.asset.json";
import svionLogo from "@/assets/svion-logo.png.asset.json";
import coaLogo from "@/assets/coa-svit-logo.png.asset.json";

export type CollegeSlug = "svit" | "svica" | "svion" | "svit-coa";

export interface College {
  id: CollegeSlug;
  name: string;
  shortCode: string;
  // TODO: confirm final tagline copy with site owner (currently placeholder).
  tagline: string;
  // Logo file to be supplied by the site owner. Placeholder rendered until then.
  logo: string;
  route: string;
  hero: {
    // TODO: confirm final hero headline/subhead copy.
    kicker: string;
    subhead: string;
  };
  stats: { value: string; label: string }[] | null;
  whyChoose: { title: string; desc: string; icon: string }[] | null;
  recruiters: string[] | null;
}

export const colleges: College[] = [
  {
    id: "svit",
    name: "Sardar Vallabhbhai Patel Institute of Technology",
    shortCode: "SVIT",
    tagline: "Engineering Tomorrow's Innovators",
    logo: svitLogo.url,
    route: "/colleges/svit",
    hero: {
      kicker: "Est. 2005 · Vasad, Gujarat",
      subhead:
        "The flagship institute of the SVIT Group — offering AICTE-approved Engineering, Diploma, MBA and MCA programmes with 95%+ placement across 200+ recruiting partners.",
    },
    stats: null,
    whyChoose: null,
    recruiters: null,
  },
  {
    id: "svica",
    name: "Sardar Vallabhbhai Patel Institute of Computer Applications",
    shortCode: "SVICA",
    tagline: "Shaping Careers in Computer Applications",
    logo: svicaLogo.url,
    route: "/colleges/svica",
    hero: {
      kicker: "Computer Applications · SVIT Group",
      subhead:
        "SVICA offers industry-aligned BCA and B.Sc IT programmes with strong foundations in programming, data, and modern software engineering.",
    },
    stats: null,
    whyChoose: null,
    recruiters: null,
  },
  {
    id: "svion",
    name: "Sardar Vallabhbhai Patel Institute of Nursing",
    shortCode: "SVION",
    tagline: "Nursing Excellence, Compassion in Care",
    logo: svionLogo.url,
    route: "/colleges/svion",
    hero: {
      kicker: "Nursing · SVIT Group",
      subhead:
        "SVION trains skilled, compassionate nursing professionals through hands-on clinical practice and mentorship by senior healthcare educators.",
    },
    stats: null,
    whyChoose: null,
    recruiters: null,
  },
  {
    id: "svit-coa",
    name: "College of Architecture",
    shortCode: "COA",
    tagline: "Designing Spaces, Building Futures",
    logo: coaLogo.url,
    route: "/colleges/svit-coa",
    hero: {
      kicker: "Architecture · SVIT Group",
      subhead:
        "A COA-approved architecture school with design studios, workshops, and heritage & sustainability electives that shape thoughtful, responsible architects.",
    },
    stats: null,
    whyChoose: null,
    recruiters: null,
  },
];

export const collegeMap: Record<CollegeSlug, College> = Object.fromEntries(
  colleges.map((c) => [c.id, c]),
) as Record<CollegeSlug, College>;
