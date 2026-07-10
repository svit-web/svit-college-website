export const site = {
  name: "SVIT",
  fullName: "Sardar Vallabhbhai Institute of Technology",
  location: "Vasad, Gujarat",
  email: "info@svitvasad.ac.in",
  phone: "+91 2692 274766",
  address: "Beside GIDC Vasad, Vasad — 388306, Anand, Gujarat, India",
};

export const primaryNav = [
  { label: "Home", to: "/" },
  { label: "About Us", to: "/about" },
  { label: "Courses", to: "/courses" },
  { label: "Admissions", to: "/admissions" },
  { label: "Campus Life", to: "/campus-life" },
  { label: "Placement", to: "/placement" },
  { label: "Contact Us", to: "/contact" },
] as const;

export const topNav = [
  { label: "Students", to: "/student-login" },
  { label: "Parents", to: "/parents" },
  { label: "Alumni", to: "/alumni" },
  { label: "Careers", to: "/careers" },
] as const;

export type CourseSlug =
  | "engineering"
  | "architecture"
  | "mba"
  | "mca"
  | "bsc"
  | "bba"
  | "diploma";

export interface Course {
  slug: CourseSlug;
  name: string;
  tagline: string;
  short: string;
  fullName: string;
  duration: string;
  eligibility: string;
  intake: string;
  color: string;
  accent: string;
  description: string;
  outcomes: string[];
  highlights: string[];
}

export const courses: Course[] = [
  {
    slug: "engineering",
    name: "Engineering",
    tagline: "B.E. — Undergraduate Engineering",
    short: "BE",
    fullName: "Bachelor of Engineering",
    duration: "4 Years",
    eligibility: "10+2 with PCM (min 45%)",
    intake: "540 seats",
    color: "bg-navy",
    accent: "text-navy",
    description: "Twelve specialised engineering branches, AICTE-approved, taught by experienced faculty with strong industry linkages.",
    outcomes: ["Industry-ready engineering skills", "Research & innovation exposure", "Placement in top companies", "Higher studies pathway (M.Tech / MS)"],
    highlights: ["Modern laboratories", "Industry collaborations", "Project-based learning", "Skill development cells"],
  },
  {
    slug: "architecture",
    name: "Architecture",
    tagline: "B.Arch — Bachelor of Architecture",
    short: "BArch",
    fullName: "Bachelor of Architecture",
    duration: "5 Years",
    eligibility: "10+2 with Maths, NATA qualified",
    intake: "40 seats",
    color: "bg-crimson",
    accent: "text-crimson",
    description: "COA-approved architecture programme with design studios, urban planning exposure, and heritage conservation electives.",
    outcomes: ["Design & drafting mastery", "Sustainable architecture practice", "Portfolio for practice or research", "Licensed architect eligibility"],
    highlights: ["Design studios", "Model making workshop", "Site visits", "Industry mentorship"],
  },
  {
    slug: "mba",
    name: "MBA",
    tagline: "Master of Business Administration",
    short: "MBA",
    fullName: "Master of Business Administration",
    duration: "2 Years",
    eligibility: "Graduation with 50%, CMAT/CAT",
    intake: "120 seats",
    color: "bg-navy",
    accent: "text-navy",
    description: "Two-year full-time AICTE-approved MBA with specialisations in Finance, Marketing, HR and Operations.",
    outcomes: ["Business leadership", "Analytical decision-making", "Corporate placements", "Entrepreneurship readiness"],
    highlights: ["Live projects", "Corporate mentors", "International exposure", "Case-based learning"],
  },
  {
    slug: "mca",
    name: "MCA",
    tagline: "Master of Computer Applications",
    short: "MCA",
    fullName: "Master of Computer Applications",
    duration: "2 Years",
    eligibility: "Graduation with Maths / Statistics",
    intake: "60 seats",
    color: "bg-crimson",
    accent: "text-crimson",
    description: "Advanced computer applications programme covering software engineering, data science, and full-stack development.",
    outcomes: ["Full-stack development skills", "Data science exposure", "Software architecture", "IT industry placements"],
    highlights: ["Coding labs", "Hackathons", "Open-source contribution", "Cloud certifications"],
  },
  {
    slug: "bsc",
    name: "B.Sc",
    tagline: "Bachelor of Science (IT)",
    short: "BSc",
    fullName: "Bachelor of Science in Information Technology",
    duration: "3 Years",
    eligibility: "10+2 with Science",
    intake: "60 seats",
    color: "bg-navy",
    accent: "text-navy",
    description: "Undergraduate IT programme with foundations in programming, databases, and emerging tech.",
    outcomes: ["Programming proficiency", "IT support careers", "Higher studies pathway", "Certification readiness"],
    highlights: ["Programming labs", "Project work", "Industry visits", "Skill workshops"],
  },
  {
    slug: "bba",
    name: "BBA",
    tagline: "Bachelor of Business Administration",
    short: "BBA",
    fullName: "Bachelor of Business Administration",
    duration: "3 Years",
    eligibility: "10+2 in any stream",
    intake: "120 seats",
    color: "bg-gold",
    accent: "text-gold",
    description: "Undergraduate management programme designed to build core business acumen and leadership from day one.",
    outcomes: ["Business fundamentals", "Communication & leadership", "Internship exposure", "MBA-ready graduates"],
    highlights: ["Business simulations", "Corporate visits", "Guest lectures", "Personality development"],
  },
  {
    slug: "diploma",
    name: "Diploma",
    tagline: "Diploma in Engineering",
    short: "Dip",
    fullName: "Diploma in Engineering (various branches)",
    duration: "3 Years",
    eligibility: "10th pass",
    intake: "300 seats",
    color: "bg-crimson",
    accent: "text-crimson",
    description: "GTU-affiliated diploma programmes across core engineering branches, workshop-driven curriculum.",
    outcomes: ["Technician-level skills", "Direct-to-industry", "Lateral entry to B.E.", "Government job readiness"],
    highlights: ["Workshops", "Practical training", "Skill India tie-ups", "Placement support"],
  },
];

export interface EngDept {
  slug: string;
  name: string;
  short: string;
  overview: string;
  icon: string;
  color: string;
  labs: string[];
  careers: string[];
}

export const engDepts: EngDept[] = [
  { slug: "computer", name: "Computer Engineering", short: "CE", overview: "Software systems, algorithms, and modern computing platforms.", icon: "Cpu", color: "bg-navy", labs: ["OS Lab", "Networks Lab", "Software Engineering Lab"], careers: ["Software Engineer", "Systems Architect", "DevOps Engineer"] },
  { slug: "information-technology", name: "Information Technology", short: "IT", overview: "Applied IT, web systems, cloud computing, and enterprise software.", icon: "Globe", color: "bg-navy-light", labs: ["Web Lab", "Cloud Lab", "Database Lab"], careers: ["Full-Stack Developer", "Cloud Engineer", "IT Consultant"] },
  { slug: "civil", name: "Civil Engineering", short: "CL", overview: "Structural design, transportation, water resources and construction.", icon: "Building2", color: "bg-crimson", labs: ["Structures Lab", "Geotech Lab", "Concrete Lab"], careers: ["Structural Engineer", "Project Manager", "Urban Planner"] },
  { slug: "mechanical", name: "Mechanical Engineering", short: "ME", overview: "Design, thermodynamics, manufacturing and mechatronics.", icon: "Cog", color: "bg-navy", labs: ["Thermal Lab", "CAD/CAM Lab", "Workshop"], careers: ["Design Engineer", "Manufacturing Lead", "R&D Engineer"] },
  { slug: "electrical", name: "Electrical Engineering", short: "EE", overview: "Power systems, machines, and renewable energy engineering.", icon: "Zap", color: "bg-gold", labs: ["Machines Lab", "Power Systems Lab", "Renewables Lab"], careers: ["Power Engineer", "Grid Analyst", "Energy Consultant"] },
  { slug: "electronics-communication", name: "Electronics & Communication", short: "EC", overview: "Signals, embedded systems, VLSI and communication engineering.", icon: "Radio", color: "bg-navy-light", labs: ["VLSI Lab", "Embedded Lab", "Communication Lab"], careers: ["Embedded Engineer", "VLSI Designer", "RF Engineer"] },
  { slug: "instrumentation-control", name: "Instrumentation & Control", short: "IC", overview: "Process control, sensors, automation and industrial instrumentation.", icon: "Gauge", color: "bg-crimson", labs: ["Process Control Lab", "Sensors Lab", "PLC Lab"], careers: ["Automation Engineer", "Control Systems Engineer", "Instrumentation Lead"] },
  { slug: "chemical", name: "Chemical Engineering", short: "CH", overview: "Process design, reaction engineering, and sustainable chemicals.", icon: "FlaskConical", color: "bg-navy", labs: ["Unit Operations Lab", "Reaction Engineering Lab", "Process Simulation Lab"], careers: ["Process Engineer", "Plant Manager", "Sustainability Consultant"] },
  { slug: "automobile", name: "Automobile Engineering", short: "AU", overview: "Vehicle design, EV powertrains, and automotive manufacturing.", icon: "Car", color: "bg-crimson", labs: ["Engines Lab", "Vehicle Dynamics Lab", "EV Lab"], careers: ["Automotive Engineer", "EV Specialist", "Test Engineer"] },
  { slug: "ai-data-science", name: "AI & Data Science", short: "AI-DS", overview: "Data engineering, ML pipelines, statistics and applied AI.", icon: "Brain", color: "bg-navy-light", labs: ["ML Lab", "Big Data Lab", "Visualization Lab"], careers: ["Data Scientist", "ML Engineer", "Analytics Consultant"] },
  { slug: "ai-machine-learning", name: "AI & Machine Learning", short: "AI-ML", overview: "Deep learning, computer vision, NLP and reinforcement learning.", icon: "Sparkles", color: "bg-gold", labs: ["Deep Learning Lab", "Vision Lab", "NLP Lab"], careers: ["AI Engineer", "Research Scientist", "Applied ML Lead"] },
  { slug: "cyber-security", name: "Cyber Security", short: "CS", overview: "Network security, ethical hacking, cryptography and cyber defence.", icon: "Shield", color: "bg-crimson", labs: ["Cyber Range", "Forensics Lab", "Crypto Lab"], careers: ["Security Analyst", "Pen Tester", "SOC Engineer"] },
];

export const stats = [
  { value: "20+", label: "Years of Excellence" },
  { value: "5000+", label: "Students" },
  { value: "100+", label: "Faculty Members" },
  { value: "15+", label: "Acre Green Campus" },
  { value: "95%", label: "Placement Record" },
  { value: "200+", label: "Recruiting Partners" },
];

export const whyChoose = [
  { title: "AICTE-approved programmes", desc: "Nationally recognised curriculum aligned with industry standards.", icon: "BadgeCheck" },
  { title: "Experienced faculty", desc: "100+ senior mentors with academic and industry backgrounds.", icon: "GraduationCap" },
  { title: "Strong placement record", desc: "95%+ placement across engineering, MBA and MCA programmes.", icon: "Briefcase" },
  { title: "Modern infrastructure", desc: "Well-equipped labs, digital library and innovation centres.", icon: "Building2" },
  { title: "Vibrant campus life", desc: "50+ clubs, sports and cultural fests all year round.", icon: "Users" },
  { title: "Research & innovation", desc: "Funded projects, patents and startup incubation support.", icon: "Lightbulb" },
];

export const events = [
  { title: "Ananya 2026 Cultural Fest", date: "Feb 12, 2026", excerpt: "Three days of music, dance, drama and food across the campus greens.", tag: "Culture" },
  { title: "TechFest — National Symposium", date: "Mar 8, 2026", excerpt: "Hackathons, tech talks and workshops with industry leaders.", tag: "Tech" },
  { title: "Placement Drive — TCS, Infosys, Wipro", date: "Jan 20, 2026", excerpt: "Campus placement drive for 2026 graduating batch.", tag: "Placement" },
  { title: "Sportlon Annual Sports Meet", date: "Nov 25, 2025", excerpt: "Inter-department sports and athletics tournament.", tag: "Sports" },
];

export const recruiters = [
  "TCS", "Infosys", "Wipro", "L&T", "Reliance", "Adani",
  "Cognizant", "Accenture", "HCL", "Tech Mahindra", "Capgemini", "IBM",
];
