// Placement content model.
// One `placementPageContent` object per college. The shared `PlacementPage`
// template just receives the object matching the current route slug — treat
// every array here as fully admin-editable (add / remove / edit rows without
// page rebuilds).

export type PlacementSlug = "svit" | "svion" | "svica" | "coa";

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

const emptyOfficer: PlacementOfficer = {
  name: "",
  designation: "Training & Placement Officer",
  phone: "",
  email: "",
  photo: null,
};

export const placementPages: Record<PlacementSlug, PlacementPageContent> = {
  svit: {
    slug: "svit",
    collegeId: "svit",
    collegeName: "Sardar Vallabhbhai Patel Institute of Technology",
    shortCode: "SVIT",
    aboutText:
      "The Training & Placement (T&P) Cell at SVIT bridges academic learning with industry practice. From day one, students engage with structured aptitude training, coding bootcamps, mock interviews, communication workshops and industry mentorship. The cell works year-round with 200+ recruiting partners across IT services, product engineering, core engineering, manufacturing and consulting to deliver strong on-campus and off-campus placement outcomes for every engineering branch.",
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
    placementOfficer: { ...emptyOfficer },
  },
  svion: {
    slug: "svion",
    collegeId: "svion",
    collegeName: "SVIT Institute of Nursing",
    shortCode: "SVION",
    aboutText:
      "The Training & Placement Cell at SVION connects nursing graduates with leading hospitals, healthcare networks and community health organisations. Clinical rotations, skill labs, soft-skills training and licensure preparation ensure students are ready for roles across in-patient care, specialty units and public health.",
    details: {
      graphicalData: [
        { year: "2022", studentsPlaced: 40, placementPercentage: 84 },
        { year: "2023", studentsPlaced: 48, placementPercentage: 87 },
        { year: "2024", studentsPlaced: 55, placementPercentage: 90 },
        { year: "2025", studentsPlaced: 62, placementPercentage: 92 },
      ],
      statHighlights: [
        { label: "Students Placed", value: "62+" },
        { label: "Highest Package", value: "₹6 LPA" },
        { label: "Average Package", value: "₹3.2 LPA" },
        { label: "Hospitals Visited", value: "40+" },
      ],
    },
    summary: {
      placedStudents: [
        { studentName: "Sample Student A", companyName: "Apollo Hospitals", photo: null },
        { studentName: "Sample Student B", companyName: "Zydus Hospitals", photo: null },
      ],
    },
    recruiters: [
      { companyName: "Apollo Hospitals", logo: null },
      { companyName: "Zydus Hospitals", logo: null },
      { companyName: "Sterling Hospitals", logo: null },
      { companyName: "HCG Cancer Centre", logo: null },
      { companyName: "Narayana Health", logo: null },
      { companyName: "Fortis Healthcare", logo: null },
    ],
    placementOfficer: { ...emptyOfficer },
  },
  svica: {
    slug: "svica",
    collegeId: "svica",
    collegeName: "SVIT College of Applied Sciences",
    shortCode: "SVICA",
    aboutText:
      "The Training & Placement Cell at SVICA prepares applied sciences and computer applications graduates for careers in IT services, analytics, EdTech and research. Industry-led electives, live projects, certifications and mentorship drive strong placement outcomes across product and services companies.",
    details: {
      graphicalData: [
        { year: "2022", studentsPlaced: 55, placementPercentage: 80 },
        { year: "2023", studentsPlaced: 62, placementPercentage: 83 },
        { year: "2024", studentsPlaced: 70, placementPercentage: 87 },
        { year: "2025", studentsPlaced: 78, placementPercentage: 90 },
      ],
      statHighlights: [
        { label: "Students Placed", value: "78+" },
        { label: "Highest Package", value: "₹12 LPA" },
        { label: "Average Package", value: "₹3.9 LPA" },
        { label: "Companies Visited", value: "60+" },
      ],
    },
    summary: {
      placedStudents: [
        { studentName: "Sample Student A", companyName: "TCS", photo: null },
        { studentName: "Sample Student B", companyName: "Cognizant", photo: null },
      ],
    },
    recruiters: [
      { companyName: "TCS", logo: null },
      { companyName: "Infosys", logo: null },
      { companyName: "Cognizant", logo: null },
      { companyName: "Accenture", logo: null },
      { companyName: "Capgemini", logo: null },
      { companyName: "Wipro", logo: null },
    ],
    placementOfficer: { ...emptyOfficer },
  },
  coa: {
    slug: "coa",
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
    placementOfficer: { ...emptyOfficer },
  },
};

export const placementDivisions: { slug: PlacementSlug; label: string }[] = [
  { slug: "svit", label: "SVIT" },
  { slug: "svion", label: "SVION" },
  { slug: "svica", label: "SVICA" },
  { slug: "coa", label: "COA" },
];
