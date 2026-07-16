// Placement content model.
// One `placementPageContent` object per college division. The shared
// `PlacementPage` template just receives the object matching the current
// route slug — treat every array here as fully admin-editable (add /
// remove / edit rows without page rebuilds).

export type PlacementSlug = "engineering" | "architecture";

export interface PlacementYearPoint {
  year: string;
  studentsPlaced: number;
  placementPercentage: number;
}

export interface StatHighlight {
  label: string;
  value: string;
}

export interface PlacedStudent {
  studentName: string;
  companyName: string;
  photo: string | null;
}

export interface Recruiter {
  companyName: string;
  logo: string | null;
}

export interface PlacementOfficer {
  name: string;
  designation: string;
  phone: string;
  email: string;
  photo: string | null;
}

export interface PlacementPageContent {
  slug: PlacementSlug;
  collegeId: string;
  collegeName: string;
  shortCode: string;
  aboutText: string;
  details: {
    graphicalData: PlacementYearPoint[];
    statHighlights: StatHighlight[];
  };
  summary: {
    placedStudents: PlacedStudent[];
  };
  recruiters: Recruiter[];
  placementOfficer: PlacementOfficer;
}

export const placementPages: Record<PlacementSlug, PlacementPageContent> = {
  engineering: {
    slug: "engineering",
    collegeId: "svit",
    collegeName: "Sardar Vallabhbhai Patel Institute of Technology",
    shortCode: "SVIT",
    aboutText:
      "The Training & Placement (T&P) Cell at SVIT Engineering bridges academic learning with industry practice. From day one, students engage with structured aptitude training, coding bootcamps, mock interviews, communication workshops and industry mentorship. The cell works year-round with 200+ recruiting partners across IT services, product engineering, core engineering, manufacturing and consulting to deliver strong on-campus and off-campus placement outcomes for every engineering branch.",
    details: {
      graphicalData: [
        { year: "2020", studentsPlaced: 152, placementPercentage: 82 },
        { year: "2021", studentsPlaced: 168, placementPercentage: 85 },
        { year: "2022", studentsPlaced: 175, placementPercentage: 87 },
        { year: "2023", studentsPlaced: 180, placementPercentage: 88 },
        { year: "2024", studentsPlaced: 195, placementPercentage: 91 },
        { year: "2025", studentsPlaced: 211, placementPercentage: 93 },
      ],
      statHighlights: [
        { label: "Students Placed", value: "211+" },
        { label: "Highest Package", value: "₹42 LPA" },
        { label: "Average Package", value: "₹4.3 LPA" },
        { label: "Companies Visited", value: "200+" },
      ],
    },
    summary: {
      placedStudents: [
        { studentName: "Sample Student A", companyName: "TCS", photo: null },
        { studentName: "Sample Student B", companyName: "Infosys", photo: null },
        { studentName: "Sample Student C", companyName: "L&T", photo: null },
      ],
    },
    recruiters: [
      { companyName: "TCS", logo: null },
      { companyName: "Infosys", logo: null },
      { companyName: "Wipro", logo: null },
      { companyName: "L&T", logo: null },
      { companyName: "Reliance", logo: null },
      { companyName: "Adani", logo: null },
      { companyName: "Cognizant", logo: null },
      { companyName: "Accenture", logo: null },
      { companyName: "HCL", logo: null },
      { companyName: "Tech Mahindra", logo: null },
      { companyName: "Capgemini", logo: null },
      { companyName: "IBM", logo: null },
    ],
    placementOfficer: {
      name: "",
      designation: "Training & Placement Officer",
      phone: "",
      email: "",
      photo: null,
    },
  },
  architecture: {
    slug: "architecture",
    collegeId: "svit-coa",
    collegeName: "SVIT College of Architecture",
    shortCode: "COA",
    aboutText:
      "The Training & Placement Cell at SVIT College of Architecture connects students with practising architects, design studios, real-estate developers and urban-planning consultancies. Studio-driven learning, live projects, sustained industry mentorship and portfolio reviews prepare graduates for internships, licensure pathways and independent practice — with recruiters ranging from boutique design ateliers to national infrastructure firms.",
    details: {
      graphicalData: [
        { year: "2022", studentsPlaced: 22, placementPercentage: 78 },
        { year: "2023", studentsPlaced: 26, placementPercentage: 82 },
        { year: "2024", studentsPlaced: 30, placementPercentage: 86 },
        { year: "2025", studentsPlaced: 34, placementPercentage: 89 },
      ],
      statHighlights: [
        { label: "Students Placed", value: "34+" },
        { label: "Highest Package", value: "₹9 LPA" },
        { label: "Average Package", value: "₹3.8 LPA" },
        { label: "Firms Visited", value: "25+" },
      ],
    },
    summary: {
      placedStudents: [
        { studentName: "Sample Student A", companyName: "Design Studio X", photo: null },
        { studentName: "Sample Student B", companyName: "Urban Works", photo: null },
      ],
    },
    recruiters: [
      { companyName: "Design Studio X", logo: null },
      { companyName: "Urban Works", logo: null },
      { companyName: "Habitat Architects", logo: null },
      { companyName: "Shapoorji Pallonji", logo: null },
      { companyName: "L&T Realty", logo: null },
      { companyName: "Adani Realty", logo: null },
    ],
    placementOfficer: {
      name: "",
      designation: "Training & Placement Officer",
      phone: "",
      email: "",
      photo: null,
    },
  },
};

export const placementDivisions: { slug: PlacementSlug; label: string }[] = [
  { slug: "engineering", label: "Engineering" },
  { slug: "architecture", label: "Architecture" },
];
