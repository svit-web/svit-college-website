// College configs for the SVIT Group umbrella site.
// Kept as a single data source so pages can later be driven from a CMS/db.
import svitLogo from "@/assets/svit-logo.jpg.asset.json";
import svicaLogo from "@/assets/svica-logo.jpg.asset.json";
import svionLogo from "@/assets/svion-logo.png.asset.json";
import coaLogo from "@/assets/coa-svit-logo.png.asset.json";

export type CollegeSlug = "svit" | "svica" | "svion" | "svit-coa";

export interface CollegeProgram {
  name: string;
  short?: string;
  duration?: string;
  eligibility?: string;
  intake?: string;
  color?: string; // tailwind bg-* token from existing design system
}

export interface CollegeProgramGroup {
  group: string;
  programs: CollegeProgram[];
}

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
  programGroups: CollegeProgramGroup[];
  stats: { value: string; label: string }[] | null;
  whyChoose: { title: string; desc: string; icon: string }[] | null;
  recruiters: string[] | null;
}

export const colleges: College[] = [
  {
    id: "svit",
    name: "Sardar Vallabhbhai Patel Institute of Technology",
    shortCode: "SVIT",
    // TODO: confirm final tagline copy
    tagline: "Engineering Tomorrow's Innovators",
    logo: "/assets/logos/svit-logo.png",
    route: "/colleges/svit",
    hero: {
      kicker: "Est. 2005 · Vasad, Gujarat",
      subhead:
        "The flagship institute of the SVIT Group — offering AICTE-approved Engineering, Diploma and Management programmes with 95%+ placement across 200+ recruiting partners.",
    },
    programGroups: [
      {
        group: "Engineering",
        programs: [
          { name: "Computer Engineering", short: "CE", color: "bg-navy" },
          { name: "Information Technology", short: "IT", color: "bg-navy-light" },
          { name: "Civil Engineering", short: "CL", color: "bg-crimson" },
          { name: "Mechanical Engineering", short: "ME", color: "bg-navy" },
          { name: "Electrical Engineering", short: "EE", color: "bg-gold" },
          { name: "Electronics & Communication", short: "EC", color: "bg-navy-light" },
        ],
      },
      {
        group: "Diploma",
        programs: [
          { name: "Diploma in Engineering", short: "Dip", color: "bg-crimson" },
        ],
      },
      {
        group: "BBA / MBA",
        programs: [
          { name: "BBA", short: "BBA", color: "bg-gold" },
          { name: "MBA", short: "MBA", color: "bg-navy" },
        ],
      },
    ],
    stats: null,
    whyChoose: null,
    recruiters: null,
  },
  {
    id: "svica",
    name: "Sardar Vallabhbhai Patel Institute of Computer Applications",
    shortCode: "SVICA",
    // TODO: confirm final tagline copy
    tagline: "Shaping Careers in Computer Applications",
    logo: "/assets/logos/svica-logo.png",
    route: "/colleges/svica",
    hero: {
      kicker: "Computer Applications · SVIT Group",
      subhead:
        "SVICA offers industry-aligned BCA and B.Sc IT programmes with strong foundations in programming, data, and modern software engineering.",
    },
    programGroups: [
      {
        group: "Programmes",
        programs: [
          { name: "BCA", short: "BCA", color: "bg-navy" },
          { name: "B.Sc IT", short: "BSc", color: "bg-navy-light" },
        ],
      },
    ],
    stats: null,
    whyChoose: null,
    recruiters: null,
  },
  {
    id: "svion",
    name: "Sardar Vallabhbhai Patel Institute of Nursing",
    shortCode: "SVION",
    // TODO: confirm final tagline copy
    tagline: "Nursing Excellence, Compassion in Care",
    logo: "/assets/logos/svion-logo.png",
    route: "/colleges/svion",
    hero: {
      kicker: "Nursing · SVIT Group",
      subhead:
        "SVION trains skilled, compassionate nursing professionals through hands-on clinical practice and mentorship by senior healthcare educators.",
    },
    programGroups: [
      {
        group: "Programmes",
        // TODO: confirm final list of nursing programmes offered
        programs: [
          { name: "B.Sc Nursing", short: "BScN", color: "bg-crimson" },
          { name: "GNM", short: "GNM", color: "bg-navy" },
          { name: "ANM", short: "ANM", color: "bg-gold" },
        ],
      },
    ],
    stats: null,
    whyChoose: null,
    recruiters: null,
  },
  {
    id: "svit-coa",
    name: "SVIT College of Architecture",
    shortCode: "SVIT COA",
    // TODO: confirm final tagline copy
    tagline: "Designing Spaces, Building Futures",
    logo: "/assets/logos/svit-coa-logo.png",
    route: "/colleges/svit-coa",
    hero: {
      kicker: "Architecture · SVIT Group",
      subhead:
        "A COA-approved architecture school with design studios, workshops, and heritage & sustainability electives that shape thoughtful, responsible architects.",
    },
    programGroups: [
      {
        group: "Programmes",
        programs: [
          { name: "B.Arch", short: "BArch", color: "bg-crimson" },
        ],
      },
    ],
    stats: null,
    whyChoose: null,
    recruiters: null,
  },
];

export const collegeMap: Record<CollegeSlug, College> = Object.fromEntries(
  colleges.map((c) => [c.id, c]),
) as Record<CollegeSlug, College>;
