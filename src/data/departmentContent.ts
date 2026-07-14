// Editable, department-scoped content that a CMS can replace later.
// Every field is optional — the template renders sensible fallbacks or hides
// sections cleanly when nothing is supplied.

export interface DeptAchievement {
  id: string;
  title: string;
  description: string;
  date: string; // ISO
  image: string | null;
}

export interface DeptClub {
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

export interface DeptActivity {
  id: string;
  type: ActivityType;
  title: string;
  startDate: string; // ISO
  endDate?: string | null;
  notes?: string | null;
  documentUrl?: string | null;
  // Only used by MOUs — kept optional to preserve the single collection shape.
  company?: string | null;
}

export interface DepartmentContent {
  about: string | null;
  vision: string | null;
  mission: string | null;
  achievements: DeptAchievement[];
  clubs: DeptClub[];
  activities: DeptActivity[];
}

// Fallback used for any department without a specific entry — keeps the page
// rendering while a real editor fills these fields in.
export const defaultDepartmentContent: DepartmentContent = {
  about: null,
  vision: null,
  mission: null,
  achievements: [],
  clubs: [],
  activities: [],
};

export const departmentContent: Record<string, DepartmentContent> = {
  "dept-svit-be-it": {
    about:
      "The Department of Information Technology at SVIT nurtures next-generation software engineers through a curriculum that balances core computer science with modern application development, cloud, data, and AI stacks. The department emphasises project-based learning, open-source contribution, and industry engagement so students graduate job-ready.",
    vision:
      "To be a centre of excellence in Information Technology education, producing globally competent professionals with strong ethics and lifelong learning ability.",
    mission:
      "Deliver quality IT education through modern pedagogy, foster research and innovation, and build meaningful industry-academia partnerships that create career opportunities for every student.",
    achievements: [
      {
        id: "ach-it-1",
        title: "Smart India Hackathon 2024 — National Winner",
        description: "IT team won the national round with a real-time disaster response coordination platform built on Node.js and React.",
        date: "2024-12-14",
        image: null,
      },
      {
        id: "ach-it-2",
        title: "GTU Rank Holders 2024",
        description: "Three students placed in the top 10 of Gujarat Technological University for IT (BE, 2024 batch).",
        date: "2024-08-02",
        image: null,
      },
    ],
    clubs: [
      { id: "club-it-coders", name: "Coders' Club", description: "Weekly competitive programming and open-source contribution sessions.", icon: null },
      { id: "club-it-cyber", name: "CyberSec Circle", description: "CTF practice, ethical hacking labs, and industry speaker series.", icon: null },
    ],
    activities: [
      { id: "act-it-1", type: "expert_lecture", title: "Industry 5.0 and the Role of Full-Stack Engineers", startDate: "2025-02-11", notes: "By Mr. Anand Sharma, Principal Engineer, TCS.", documentUrl: null },
      { id: "act-it-2", type: "sttp_fdp", title: "One-week FDP on Cloud-Native DevOps", startDate: "2025-01-06", endDate: "2025-01-11", documentUrl: null },
      { id: "act-it-3", type: "seminar_workshop", title: "Workshop: Building with LLMs and RAG", startDate: "2024-11-20", endDate: "2024-11-21", documentUrl: null },
      { id: "act-it-4", type: "mou", title: "MOU with Infosys Springboard", startDate: "2024-09-18", company: "Infosys Ltd.", notes: "Curriculum credit, certifications, industry mentorship." },
      { id: "act-it-5", type: "industry_visit", title: "Industry Visit — Ahmedabad IT Cluster", startDate: "2024-10-04", notes: "Zensar, TCS and Simform campuses." },
    ],
  },
  "dept-svit-be-computer": {
    about:
      "The Computer Engineering department is one of SVIT's largest, offering rigorous training across systems, software, AI/ML, and networking. Students work on capstone projects with faculty mentors and industry partners, backed by well-equipped programming, networking and AI labs.",
    vision: "To create Computer Engineers who solve real-world problems through ethical, sustainable and inclusive technology.",
    mission: "Provide a strong theoretical foundation, foster practical skills, and encourage research, entrepreneurship and community-driven projects.",
    achievements: [],
    clubs: [
      { id: "club-ce-gdsc", name: "Google DSC — SVIT", description: "Student-led chapter for Google technologies, workshops and study jams.", icon: null },
    ],
    activities: [],
  },
};

export function getDepartmentContent(departmentId: string): DepartmentContent {
  return departmentContent[departmentId] ?? defaultDepartmentContent;
}
