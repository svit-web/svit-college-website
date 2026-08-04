// Training & Placement Cell Data Model & Functions
import { supabase } from '@/integrations/supabase/client';

export interface PlacementHighlight {
  id: string;
  icon: string;        // key into ICON_MAP
  label: string;
}

export interface SectionVisibility {
  about: boolean;
  trend: boolean;
  placedStudents: boolean;
  recruiters: boolean;
  officer: boolean;
  testimonials?: boolean;
}

export interface SectionConfig {
  sections: SectionVisibility;
  order: string[];
  highlights: PlacementHighlight[];
}

export interface PlacedStudent {
  id: string;
  studentName: string;
  companyName: string;
  batchYear: string;
  photo: string | null;            // URL or data: URI
  collegeId: string;               // division slug
}

export interface RecruiterItem {
  id: string;
  companyName: string;
  company_name?: string;
  logo: string | null;
  status?: "active" | "inactive";
  sortOrder?: number;
}

export type Recruiter = RecruiterItem;

export interface PlacementOfficer {
  name: string;
  designation: string;
  phone: string;
  email: string;
  photo: string | null;
}

export interface PlacementYearPoint {
  year: string;
  studentsPlaced: number;
  placementPercentage: number;
}

export interface PlacementTestimonial {
  id: string;
  studentName: string;
  designation: string;
  companyName: string;
  batchYear: string;
  departmentName: string;
  quote: string;
  photoUrl: string | null;
  rating?: number;
}

export interface DivisionInfo {
  slug: string;
  name: string;
  shortCode: string;
  isCustom?: boolean;
}

export interface FullPlacementData {
  divisions: DivisionInfo[];
  heroTitle: string;
  heroSubtitle: string;
  highestPackage: string;
  averagePackage: string;
  aboutText: string;
  sectionConfig: SectionConfig;
  officer: PlacementOfficer;
  placedStudents: PlacedStudent[];
  recruiters: RecruiterItem[];
  graphicalData: PlacementYearPoint[];
  testimonials: PlacementTestimonial[];
  divisionContents: Record<string, {
    aboutText: string;
    officer: PlacementOfficer;
    graphicalData: PlacementYearPoint[];
  }>;
}

export const DEFAULT_DIVISIONS: DivisionInfo[] = [
  { slug: "svit",  name: "Sardar Vallabhbhai Patel Institute of Technology", shortCode: "SVIT (Degree)" },
  { slug: "coa",   name: "SVIT College of Architecture",                     shortCode: "COA (Architecture)" },
  { slug: "svica", name: "SVIT College of Computer Applications",            shortCode: "SVICA (Comp. Apps)" },
  { slug: "svion", name: "SVIT Institute of Nursing",                        shortCode: "SVION (Nursing)" },
];

export const DEFAULT_HIGHLIGHTS: PlacementHighlight[] = [
  { id: "h1", icon: "Target", label: "Industry-aligned Skill Bootcamps & Aptitude Training" },
  { id: "h2", icon: "MessagesSquare", label: "Mock Technical & HR Interview Practice" },
  { id: "h3", icon: "Briefcase", label: "200+ Top Recruiting Partners Nationwide" },
  { id: "h4", icon: "Award", label: "Paid Internships & Pre-Placement Offers (PPOs)" },
  { id: "h5", icon: "CalendarCheck", label: "Structured Annual On-Campus Drive Schedule" },
  { id: "h6", icon: "UserCheck", label: "Dedicated Branch-Wise Student Mentorship" },
];

export const DEFAULT_TESTIMONIALS: PlacementTestimonial[] = [
  {
    id: "t1",
    studentName: "Aarav Sharma",
    designation: "Software Engineer",
    companyName: "Google",
    batchYear: "2024",
    departmentName: "Computer Engineering",
    quote: "The T&P Cell at SVIT conducted rigorous mock interviews and competitive programming bootcamps. The structured placement drives gave me the confidence to crack the Google interview!",
    photoUrl: null,
    rating: 5,
  },
  {
    id: "t2",
    studentName: "Priya Patel",
    designation: "Systems Engineer",
    companyName: "TCS Ninja",
    batchYear: "2024",
    departmentName: "Information Technology",
    quote: "From resume building workshops to soft skills mentorship, the placement cell guided us at every step. I am immensely grateful for the continuous corporate exposure provided at SVIT Vasad.",
    photoUrl: null,
    rating: 5,
  },
  {
    id: "t3",
    studentName: "Kavya Soni",
    designation: "Architectural Designer",
    companyName: "Sthapati Studio",
    batchYear: "2024",
    departmentName: "College of Architecture",
    quote: "SVIT COA helped connect our portfolio directly with top architectural consultancies. The campus recruitment drives were smooth, professional, and career-defining.",
    photoUrl: null,
    rating: 5,
  },
  {
    id: "t4",
    studentName: "Riddhi Shah",
    designation: "Associate Analyst",
    companyName: "HCLTech",
    batchYear: "2024",
    departmentName: "Computer Applications (SVICA)",
    quote: "The hands-on technical labs and dedicated placement training helped me secure an excellent package right in my final semester. SVIT's placement support is top-notch!",
    photoUrl: null,
    rating: 5,
  },
  {
    id: "t5",
    studentName: "Meera Patel",
    designation: "Staff Nurse",
    companyName: "Apollo Hospitals",
    batchYear: "2024",
    departmentName: "Institute of Nursing (SVION)",
    quote: "Our clinical internships combined with on-campus healthcare recruitment allowed me to start my nursing career at Apollo Hospitals immediately upon graduation.",
    photoUrl: null,
    rating: 5,
  },
  {
    id: "t6",
    studentName: "Ananya Desai",
    designation: "Cloud Consultant",
    companyName: "Microsoft",
    batchYear: "2024",
    departmentName: "Electronics & Communication",
    quote: "SVIT Vasad provides world-class infrastructure and industry partnerships. The T&P mentors helped me refine my technical problem solving and soft skills to land my dream job.",
    photoUrl: null,
    rating: 5,
  },
];

export const DEFAULT_PLACEMENT_DATA: FullPlacementData = {
  divisions: DEFAULT_DIVISIONS,
  heroTitle: "Training & Placement Cell",
  heroSubtitle: "Empowering SVIT graduates with world-class career opportunities, industry mentorship, and top campus recruitment.",
  highestPackage: "₹42 LPA",
  averagePackage: "₹11.5 LPA",
  aboutText: "The Training & Placement Cell at SVIT Group of Institutions acts as a seamless bridge between academic excellence and corporate demand. We conduct year-round skill development, aptitude training, mock interviews, and industry interface sessions to ensure our engineering, architecture, computer applications, and nursing graduates achieve stellar career outcomes.",
  sectionConfig: {
    sections: {
      about: true,
      trend: true,
      placedStudents: true,
      recruiters: true,
      officer: true,
      testimonials: true,
    },
    order: ["about", "trend", "placedStudents", "recruiters", "officer", "testimonials"],
    highlights: DEFAULT_HIGHLIGHTS,
  },
  officer: {
    name: "Dr. K. M. Patel",
    designation: "Head — Training & Placement Cell",
    phone: "+91 98250 12345",
    email: "tnp@svitvasad.ac.in",
    photo: null,
  },
  graphicalData: [
    { year: "2020", studentsPlaced: 152, placementPercentage: 82 },
    { year: "2021", studentsPlaced: 168, placementPercentage: 85 },
    { year: "2022", studentsPlaced: 175, placementPercentage: 87 },
    { year: "2023", studentsPlaced: 180, placementPercentage: 88 },
    { year: "2024", studentsPlaced: 195, placementPercentage: 91 },
    { year: "2025", studentsPlaced: 211, placementPercentage: 93 },
  ],
  recruiters: [
    { id: "r1", companyName: "TCS", logo: "https://upload.wikimedia.org/wikipedia/commons/b/b1/Tata_Consultancy_Services_Logo.svg" },
    { id: "r2", companyName: "Infosys", logo: "https://upload.wikimedia.org/wikipedia/commons/9/95/Infosys_logo.svg" },
    { id: "r3", companyName: "Wipro", logo: "https://upload.wikimedia.org/wikipedia/commons/a/a0/Wipro_Primary_Logo_Color_RGB.svg" },
    { id: "r4", companyName: "L&T", logo: null },
    { id: "r5", companyName: "Tata Motors", logo: null },
    { id: "r6", companyName: "Reliance Industries", logo: null },
    { id: "r7", companyName: "Adani Group", logo: null },
    { id: "r8", companyName: "Tech Mahindra", logo: null },
    { id: "r9", companyName: "Capgemini", logo: null },
    { id: "r10", companyName: "Accenture", logo: null },
    { id: "r11", companyName: "Cognizant", logo: null },
    { id: "r12", companyName: "HCLTech", logo: null },
    { id: "r13", companyName: "ICICI Bank", logo: null },
    { id: "r14", companyName: "HDFC Bank", logo: null },
    { id: "r15", companyName: "Amazon", logo: null },
    { id: "r16", companyName: "IBM", logo: null },
    { id: "r17", companyName: "Oracle", logo: null },
    { id: "r18", companyName: "Cybage", logo: null },
    { id: "r19", companyName: "Crest Data Systems", logo: null },
    { id: "r20", companyName: "Torrent Power", logo: null },
    { id: "r21", companyName: "Alembic", logo: null },
    { id: "r22", companyName: "Sun Pharma", logo: null },
    { id: "r23", companyName: "L&T Infotech", logo: null },
    { id: "r24", companyName: "Mindtree", logo: null },
  ],
  placedStudents: [
    { id: "s1", studentName: "Aarav Sharma", companyName: "Google", batchYear: "2024", photo: null, collegeId: "svit" },
    { id: "s2", studentName: "Priya Patel", companyName: "TCS", batchYear: "2024", photo: null, collegeId: "svit" },
    { id: "s3", studentName: "Rohan Mehta", companyName: "Infosys", batchYear: "2024", photo: null, collegeId: "svit" },
    { id: "s4", studentName: "Ananya Desai", companyName: "Microsoft", batchYear: "2024", photo: null, collegeId: "svit" },
    { id: "s5", studentName: "Kunal Shah", companyName: "Amazon", batchYear: "2024", photo: null, collegeId: "svit" },
    { id: "s6", studentName: "Neha Joshi", companyName: "L&T", batchYear: "2024", photo: null, collegeId: "svit" },
    { id: "s7", studentName: "Vikram Rathod", companyName: "Reliance Industries", batchYear: "2024", photo: null, collegeId: "svit" },
    { id: "s8", studentName: "Siddharth Varma", companyName: "Adani Group", batchYear: "2024", photo: null, collegeId: "svit" },
    { id: "s9", studentName: "Diya Trivedi", companyName: "Wipro", batchYear: "2024", photo: null, collegeId: "svit" },
    { id: "s10", studentName: "Harsh Pandya", companyName: "Tech Mahindra", batchYear: "2024", photo: null, collegeId: "svit" },
    { id: "s11", studentName: "Pooja Solanki", companyName: "Capgemini", batchYear: "2024", photo: null, collegeId: "svit" },
    { id: "s12", studentName: "Aditya Bhatt", companyName: "Cognizant", batchYear: "2024", photo: null, collegeId: "svit" },
    { id: "s13", studentName: "Kavya Soni", companyName: "Sthapati Studio", batchYear: "2024", photo: null, collegeId: "coa" },
    { id: "s14", studentName: "Manav Parikh", companyName: "Morphogenesis", batchYear: "2024", photo: null, collegeId: "coa" },
    { id: "s15", studentName: "Riddhi Shah", companyName: "HCLTech", batchYear: "2024", photo: null, collegeId: "svica" },
    { id: "s16", studentName: "Yash Vyas", companyName: "Cybage", batchYear: "2024", photo: null, collegeId: "svica" },
    { id: "s17", studentName: "Meera Patel", companyName: "Apollo Hospitals", batchYear: "2024", photo: null, collegeId: "svion" },
    { id: "s18", studentName: "Dhaval Patel", companyName: "Zydus Hospital", batchYear: "2024", photo: null, collegeId: "svion" },
    { id: "s19", studentName: "Chirag Gandhi", companyName: "Torrent Power", batchYear: "2023", photo: null, collegeId: "svit" },
    { id: "s20", studentName: "Bhavna Patel", companyName: "Alembic", batchYear: "2023", photo: null, collegeId: "svit" },
    { id: "s21", studentName: "Jayesh Patel", companyName: "Sun Pharma", batchYear: "2023", photo: null, collegeId: "svit" },
    { id: "s22", studentName: "Kriti Sharma", companyName: "Accenture", batchYear: "2023", photo: null, collegeId: "svit" },
  ],
  testimonials: DEFAULT_TESTIMONIALS,
  divisionContents: {
    svit: {
      aboutText: "SVIT Degree College offers placement support across Computer, IT, EC, Electrical, Mechanical, Civil, and Aeronautical Engineering with over 150+ annual drives.",
      officer: {
        name: "Dr. K. M. Patel",
        designation: "Head — Training & Placement Cell (SVIT)",
        phone: "+91 98250 12345",
        email: "tnp@svitvasad.ac.in",
        photo: null,
      },
      graphicalData: [
        { year: "2020", studentsPlaced: 120, placementPercentage: 84 },
        { year: "2021", studentsPlaced: 135, placementPercentage: 86 },
        { year: "2022", studentsPlaced: 142, placementPercentage: 89 },
        { year: "2023", studentsPlaced: 148, placementPercentage: 90 },
        { year: "2024", studentsPlaced: 160, placementPercentage: 92 },
        { year: "2025", studentsPlaced: 172, placementPercentage: 94 },
      ],
    },
    coa: {
      aboutText: "SVIT College of Architecture connects budding architects with premier design studios, urban planning firms, and architectural consultancies.",
      officer: {
        name: "Prof. Anjali Shah",
        designation: "T&P Coordinator — Architecture",
        phone: "+91 98250 54321",
        email: "coa.tnp@svitvasad.ac.in",
        photo: null,
      },
      graphicalData: [
        { year: "2020", studentsPlaced: 12, placementPercentage: 75 },
        { year: "2021", studentsPlaced: 14, placementPercentage: 78 },
        { year: "2022", studentsPlaced: 15, placementPercentage: 80 },
        { year: "2023", studentsPlaced: 16, placementPercentage: 82 },
        { year: "2024", studentsPlaced: 18, placementPercentage: 85 },
        { year: "2025", studentsPlaced: 20, placementPercentage: 88 },
      ],
    },
    svica: {
      aboutText: "SVICA provides specialized career counseling and software development campus drives for MCA & BCA students.",
      officer: {
        name: "Prof. Rajesh Verma",
        designation: "T&P Coordinator — Computer Applications",
        phone: "+91 98250 67890",
        email: "svica.tnp@svitvasad.ac.in",
        photo: null,
      },
      graphicalData: [
        { year: "2020", studentsPlaced: 12, placementPercentage: 80 },
        { year: "2021", studentsPlaced: 14, placementPercentage: 82 },
        { year: "2022", studentsPlaced: 12, placementPercentage: 84 },
        { year: "2023", studentsPlaced: 10, placementPercentage: 85 },
        { year: "2024", studentsPlaced: 11, placementPercentage: 88 },
        { year: "2025", studentsPlaced: 13, placementPercentage: 90 },
      ],
    },
    svion: {
      aboutText: "SVIT Institute of Nursing partners with leading hospital networks and healthcare providers for clinical recruitment and internship placements.",
      officer: {
        name: "Prof. Sister Mary",
        designation: "T&P Coordinator — Nursing",
        phone: "+91 98250 99999",
        email: "svion.tnp@svitvasad.ac.in",
        photo: null,
      },
      graphicalData: [
        { year: "2020", studentsPlaced: 8, placementPercentage: 85 },
        { year: "2021", studentsPlaced: 5, placementPercentage: 88 },
        { year: "2022", studentsPlaced: 6, placementPercentage: 90 },
        { year: "2023", studentsPlaced: 6, placementPercentage: 91 },
        { year: "2024", studentsPlaced: 6, placementPercentage: 93 },
        { year: "2025", studentsPlaced: 6, placementPercentage: 95 },
      ],
    },
  },
};

const STORAGE_KEY = "svit_placement_hub_data_v3";

export function getAllRecruiters(): RecruiterItem[] {
  const content = getAllPlacementContent();
  return content.recruiters.map((r) => ({
    ...r,
    company_name: r.companyName,
  }));
}

export function getAllPlacementContent(): FullPlacementData {
  if (typeof window === "undefined") {
    return DEFAULT_PLACEMENT_DATA;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PLACEMENT_DATA));
      return DEFAULT_PLACEMENT_DATA;
    }
    const parsed = JSON.parse(raw);
    return {
      divisions: parsed.divisions || DEFAULT_PLACEMENT_DATA.divisions,
      heroTitle: parsed.heroTitle || DEFAULT_PLACEMENT_DATA.heroTitle,
      heroSubtitle: parsed.heroSubtitle || DEFAULT_PLACEMENT_DATA.heroSubtitle,
      highestPackage: parsed.highestPackage || DEFAULT_PLACEMENT_DATA.highestPackage,
      averagePackage: parsed.averagePackage || DEFAULT_PLACEMENT_DATA.averagePackage,
      aboutText: parsed.aboutText || DEFAULT_PLACEMENT_DATA.aboutText,
      sectionConfig: {
        sections: { ...DEFAULT_PLACEMENT_DATA.sectionConfig.sections, ...parsed.sectionConfig?.sections },
        order: parsed.sectionConfig?.order || DEFAULT_PLACEMENT_DATA.sectionConfig.order,
        highlights: parsed.sectionConfig?.highlights || DEFAULT_PLACEMENT_DATA.sectionConfig.highlights,
      },
      officer: { ...DEFAULT_PLACEMENT_DATA.officer, ...parsed.officer },
      placedStudents: parsed.placedStudents || DEFAULT_PLACEMENT_DATA.placedStudents,
      recruiters: parsed.recruiters || DEFAULT_PLACEMENT_DATA.recruiters,
      graphicalData: parsed.graphicalData || DEFAULT_PLACEMENT_DATA.graphicalData,
      testimonials: parsed.testimonials || DEFAULT_PLACEMENT_DATA.testimonials,
      divisionContents: parsed.divisionContents || DEFAULT_PLACEMENT_DATA.divisionContents,
    };
  } catch {
    return DEFAULT_PLACEMENT_DATA;
  }
}

export async function fetchPlacementContentAsync(): Promise<FullPlacementData> {
  const localData = getAllPlacementContent();
  try {
    const { data, error } = await supabase
      .from("homepage_items")
      .select("metadata")
      .eq("section_key", "placement_hub")
      .maybeSingle();

    if (!error && data?.metadata) {
      const dbData = data.metadata as FullPlacementData;
      const merged: FullPlacementData = {
        ...DEFAULT_PLACEMENT_DATA,
        ...dbData,
        sectionConfig: {
          sections: { ...DEFAULT_PLACEMENT_DATA.sectionConfig.sections, ...dbData.sectionConfig?.sections },
          order: dbData.sectionConfig?.order || DEFAULT_PLACEMENT_DATA.sectionConfig.order,
          highlights: dbData.sectionConfig?.highlights || DEFAULT_PLACEMENT_DATA.sectionConfig.highlights,
        },
      };
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      }
      return merged;
    }
  } catch (err) {
    console.warn("Falling back to local storage placement content:", err);
  }
  return localData;
}

export function saveAllPlacementContent(data: FullPlacementData): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent("svit_placement_updated", { detail: data }));
  } catch (err) {
    console.error("Failed to save placement content to localStorage:", err);
  }

  // Best-effort attempt to persist to Supabase homepage_items table
  try {
    (async () => {
      await supabase
        .from("homepage_items")
        .upsert({
          section_key: "placement_hub",
          title: "Placement Hub Data",
          metadata: data as any,
        }, { onConflict: "section_key" });
    })().catch(() => {
      // Swallowed
    });
  } catch {
    // Swallowed
  }
}
