// About SVIT page content — treat as admin-editable CMS payload.
// Every list/table is an array so an admin panel can add/remove/reorder entries later.

export interface KeyValue { label: string; value: string }
export interface Milestone { year: string; milestone: string }
export interface BoardMember { srNo: number; name: string; designation: string }
export interface Recognition { body: string; status: string }
export interface RelatedDocument { label: string; fileUrl: string }
export interface Committee {
  name: string;
  description: string;
  vision?: string;
  mission?: string;
  keyActivities: string[];
}
export interface Scholarship { name: string; amount: string; eligibility: string }
export interface NamedDescription { name: string; description: string }
export interface LabelDescription { label: string; description: string }
export interface SocialLink { platform: string; url: string }

export interface AboutPageContent {
  hero: { title: string; accent: string; introText: string };
  quickFacts: KeyValue[];
  history: { introText: string; milestones: Milestone[]; closingText?: string };
  vision: { visionText: string };
  mission: { missionPoints: string[] };
  coreValues: string[];
  leadership: {
    intro: string;
    chairman: {
      quote: string;
      name: string;
      title: string;
      strategicPlanText?: string;
      corePrinciples?: string[];
    };
    principal: {
      quote: string;
      name: string;
      title: string;
      bodyText?: string;
    };
    boardOfManagement: BoardMember[];
  };
  accreditation: {
    recognitions: Recognition[];
    nbaText: string;
    nirfText: string;
    aicteText: string;
    academicRegulationsText: string;
    regulationPoints: string[];
    mandatoryDisclosureText: string;
    codeOfConductPoints: string[];
    relatedDocuments: RelatedDocument[];
  };
  committees: Committee[];
  facilities: {
    intro: string;
    library: { text: string; stats: KeyValue[] };
    scholarships: Scholarship[];
    sports: { text: string; activities: KeyValue[] };
    nssNcc: NamedDescription[];
    hostelsTransport: { hostelText: string; transportText: string };
    itMedical: LabelDescription[];
  };
  media: {
    intro: string;
    publications: NamedDescription[];
    socialMedia: SocialLink[];
  };
  contact: { address: string; phone: string; email: string; website: string };
}

export const aboutPageContent: AboutPageContent = {
  hero: {
    accent: "Our Story",
    title: "About SVIT",
    introText:
      "Sardar Vallabhbhai Patel Institute of Technology (SVIT), Vasad, was established in 1997 by the New English School Trust (NEST) with a vision to impart quality technical education. Named after the Iron Man of India — Sardar Vallabhbhai Patel — the institute has grown into a premier engineering and management institution in Gujarat, affiliated with Gujarat Technological University (GTU) and approved by AICTE.",
  },
  quickFacts: [
    { label: "Full Name", value: "Sardar Vallabhbhai Patel Institute of Technology" },
    { label: "Short Name", value: "SVIT" },
    { label: "Established", value: "1997" },
    { label: "Location", value: "Beside GIDC Vasad, Vasad – 388306, Anand, Gujarat, India" },
    { label: "Email", value: "info@svitvasad.ac.in" },
    { label: "Phone", value: "+91 2692 274766" },
    { label: "Affiliation", value: "Gujarat Technological University (GTU)" },
    { label: "Approvals", value: "AICTE Approved · NBA Accredited" },
    { label: "Campus", value: "15+ Acre Green Campus" },
    { label: "Students", value: "5,000+" },
    { label: "Faculty", value: "100+" },
    { label: "Alumni", value: "20,000+" },
    { label: "Placement Record", value: "95%" },
    { label: "Recruiting Partners", value: "200+" },
  ],
  history: {
    introText:
      "The New English School Trust (NEST), after careful deliberation, decided to establish a self-financed degree engineering college to serve the region. The Trust named the college after Sardar Vallabhbhai Patel — the great leader who hailed from this area — as a tribute to his legacy. Prof. Shantibhai Amin, a philanthropic administrator, was requested to take on the responsibility of establishing the college as Chairman of the Board of Management.",
    milestones: [
      { year: "1997", milestone: "AICTE approval and Gujarat University affiliation; launched Civil, Mechanical & Electrical Engineering (60 seats each)." },
      { year: "1998", milestone: "Added Computer Engineering & Information Technology (80 seats)." },
      { year: "1999", milestone: "Introduced Electronics & Communication Engineering (40 seats)." },
      { year: "2003", milestone: "Launched the MCA programme." },
      { year: "Today", milestone: "Premier institution offering 12+ engineering branches, MBA, MCA, BBA, BCA, B.Sc IT, B.Arch, Diploma and more." },
    ],
    closingText:
      "Over two decades, SVIT has developed leaps and bounds, establishing itself as an institution of quality engineering education.",
  },
  vision: {
    visionText:
      "To be an excellent academic institute by imparting quality technical education to the prospective engineers and carve them into value added technocrats who seek professional excellence, nation building and social responsibility.",
  },
  mission: {
    missionPoints: [
      "To be known as an institution of repute safeguarding societal and national interest.",
      "To cultivate adaptability and groom faculty members with changing trends in their fields by giving them opportunities to upgrade.",
      "To constantly align and orient as per societal needs by delivering knowledge on contemporary themes in accordance with job potential.",
      "To facilitate a student-centric environment and offer industrial and practical exposure.",
      "To adopt appropriate processes and practices in the field of education, research and innovation to prepare students for professional challenges.",
      "To offer good activity support — co-curricular & extra-curricular — to inculcate ethical values, right attitude and sound professionalism in students, following the ideals of Sardar Patel.",
    ],
  },
  coreValues: ["Integrity", "Curiosity", "Inclusion", "Service"],
  leadership: {
    intro:
      "SVIT is led by a distinguished team of visionaries committed to academic excellence and student success.",
    chairman: {
      quote:
        "Sardar Vallabhbhai Patel Institute of Technology was established in the year 1997 with an immaculate vision of Iron-man, Sardar Vallabhbhai Patel, with the leadership of Shree Shivabhai Patel, Shree Chandubhai Patel and Shree Shantibhai Amin to impart excellent education to the youth of our country. The prime motto, to achieve excellence, with the medium of education, as it is the most powerful weapon one can use to change the world is kept at the highest priority by SVIT.",
      name: "Shree Bhaskerbhai Patel",
      title: "Chairman, SVIT Vasad",
      strategicPlanText:
        "SVIT's strategic plan is designed to transform the culture at SVIT to enhance the student experience by fostering exceptional student-centeredness. Resources are hardened to ensure every student is engaged and can be successful at every point in their journey — while enrolled at SVIT and beyond.",
      corePrinciples: [
        "Every student is Priority.",
        "Promote the search, production, and dissemination of knowledge for the benefit of students and society.",
        "Provide a wide range of intellectual and professional opportunities that assist students in developing their potential as productive and responsible citizens.",
        "Respond to students and their needs when and where they are, to enhance student satisfaction.",
        "Improve communication, collaboration and engagement across the College and with alumni and community partners.",
      ],
    },
    principal: {
      quote:
        "Sardar Vallabhbhai Patel Institute of Technology, Vasad is one of the most promising educational hubs for the streams of engineering, architecture and vocational courses, situated between Vadodara and Anand, on the bank of the holy river MAHI. It offers career making opportunities in the disciplines viz. computer, information technology, electronics and communication, instrumentation and control, electrical, mechanical, architecture and civil, including the unique course of aeronautical engineering. We not only educate, we care too.",
      name: "Dr. D. P. Soni",
      title: "Principal, SVIT Vasad",
      bodyText:
        "The institute promotes various scholastic and co-scholastic activities — research and development, sports, skills, innovations and start-ups. It keeps evolving strategies to provide students with global career opportunities by signing MoUs with national and international apex universities, enabling overseas study scopes. Our innovative pedagogy aims at holistic character development — making students skillful, academically inquisitive, scientifically innovative, spiritually wise and emotionally strong.",
    },
    boardOfManagement: [
      { srNo: 1, name: "Patel Bhaskerbhai Chandubhai", designation: "Chairman – SVIT & NEST" },
      { srNo: 2, name: "Patel Dipakkumar Kantibhai", designation: "NEST – Trustee" },
      { srNo: 3, name: "Patel Sandipbhai Rameshbhai", designation: "Vice Chairman – NEST" },
      { srNo: 4, name: "Patel Bhaveshbhai Rameshbhai", designation: "Secretary – NEST" },
      { srNo: 5, name: "Patel Ketanbhai Bhupendrabhai", designation: "Jt. Secretary – NEST" },
      { srNo: 6, name: "Patel Kishorkumar Ramdas", designation: "Treasurer – NEST" },
    ],
  },
  accreditation: {
    recognitions: [
      { body: "NBA (National Board of Accreditation), New Delhi", status: "Accredited" },
      { body: "AICTE (All India Council for Technical Education)", status: "Approved" },
      { body: "GTU (Gujarat Technological University)", status: "Affiliated" },
      { body: "NIRF (National Institutional Ranking Framework)", status: "Active Participant" },
    ],
    nbaText:
      "SVIT is accredited by NBA (National Board of Accreditation), New Delhi. The NBA accreditation is a hallmark of excellence in technical education, ensuring that programs meet global standards of quality.",
    nirfText:
      "SVIT actively participates in the National Institutional Ranking Framework (NIRF) and has consistently demonstrated its commitment to academic excellence, research, and overall institutional development.",
    aicteText:
      "All programs offered by SVIT are approved by the All India Council for Technical Education (AICTE), the statutory body for technical education in India.",
    academicRegulationsText:
      "SVIT follows academic regulations prescribed by Gujarat Technological University (GTU). Key regulations:",
    regulationPoints: [
      "Minimum 75% attendance required",
      "Grading system: AA to FF",
      "Semester Performance Index (SPI) and Cumulative Performance Index (CPI)",
      "First Class with Distinction: CPI 7.1 and above",
      "First Class: CPI 6.5 and above",
      "Second Class: CPI 5.5 and above",
    ],
    mandatoryDisclosureText:
      "SVIT maintains complete transparency by publishing all mandatory disclosures as per AICTE and UGC guidelines — faculty details, infrastructure, financial statements, and admission statistics. The institute enforces a strict code of conduct prohibiting:",
    codeOfConductPoints: [
      "Ragging in any form (criminal act as per Supreme Court)",
      "Disrespect, use of alcohol/drugs on campus",
      "Library mutilation or disruption of academic activities",
      "Hacking, cybercrime, and unauthorized money collection",
    ],
    relatedDocuments: [
      { label: "NBA Status", fileUrl: "/Document/nba.pdf" },
      { label: "NIRF 2026", fileUrl: "/img/NIRF2026.pdf" },
      { label: "AICTE Approval", fileUrl: "/document/aicte-approval.pdf" },
      { label: "Mandatory Disclosure", fileUrl: "/document/mandatory-disclosure.pdf" },
      { label: "Academic Regulations", fileUrl: "/engineering/academic-regulations" },
    ],
  },
  committees: [
    {
      name: "Women Development Cell",
      description:
        "Created to ensure a safe working environment for the female fraternity. Organizes programs on women empowerment.",
      vision:
        "To assist women in achieving full potential in education, career and personal life through academic and intellectual growth and personal empowerment.",
      mission:
        "To educate them on gender-related issues, showcase their talent, boost confidence, identify strength areas, and motivate them towards individuality.",
      keyActivities: [
        "Creates social awareness among female staff and girl students about relevant issues",
        "Organizes seminars and workshops for general awareness and orientation",
        "Conducts training programs and creates awareness about self-employment schemes",
        "Promotes general well-being of female students and staff",
      ],
    },
    {
      name: "Grievance Redressal Cell",
      description:
        "Functions to enquire into grievances and suggest final action at the institutional level for redressal.",
      keyActivities: [
        "Ensures fair, impartial and consistent redressal of issues faced by students",
        "Develops a responsive and accountable attitude among students",
        "Maintains harmonious atmosphere in the college campus",
        "Resolves grievances with complete confidentiality",
        "Handles: physical harassment, mental harassment, complaints against teaching/administrative staff, accommodation/hostel, and transportation issues",
      ],
    },
    {
      name: "Sexual Harassment Cell",
      description:
        "Established per UGC, NAAC, and Supreme Court guidelines to provide a healthy and congenial atmosphere for all staff and students.",
      keyActivities: [
        "Promotes gender equality and removal of gender bias",
        "Addresses sexual harassment and gender-based violence",
        "Treats all complaints with dignity and respect",
        "Maintains complete confidentiality of complaints",
      ],
    },
    {
      name: "Anti-Ragging Committee",
      description:
        "Ragging in any form is strictly forbidden. The committee punishes students found guilty as per UGC regulations.",
      keyActivities: [
        "Awareness programs on dehumanizing effects of ragging",
        "Continuous watch and vigil across campus",
        "Stringent action against ragging incidents",
        "Regular checks of hostels, buses, canteens, and classrooms",
        "Follows Supreme Court guidelines — Civil Appeal No. 887 of 2009",
      ],
    },
    {
      name: "Internal Quality Assurance Cell (IQAC)",
      description:
        "Apex body overseeing the internal quality assurance system with appropriate structures and processes.",
      keyActivities: [
        "Plans, guides, and monitors Quality Assurance and Quality Enhancement activities",
        "Channelizes efforts towards academic excellence",
        "Develops quality circles within the institute",
        "Collects feedback from all stakeholders",
        "Organizes workshops and seminars on quality improvement",
      ],
    },
  ],
  facilities: {
    intro:
      "SVIT's 15+ acre green campus is equipped with modern infrastructure designed to support academic, co-curricular, and residential needs.",
    library: {
      text: "The SVIT Library consists of a central library and 10 departmental libraries. Resources include:",
      stats: [
        { label: "Titles of books", value: "14,318" },
        { label: "Volumes", value: "52,189" },
        { label: "Back-volumes of periodicals", value: "2,375" },
        { label: "E-books", value: "3,000+" },
        { label: "NPTEL video lectures", value: "950+" },
        { label: "Printed periodicals", value: "225+" },
        { label: "Books under Book Bank Scheme", value: "5,200+" },
        { label: "Online E-Journals", value: "Science Direct" },
      ],
    },
    scholarships: [
      { name: "Saksham Scholarship", amount: "₹30,000", eligibility: "Differently-abled students (40%+ disability), family income < ₹8 lakhs" },
      { name: "MYSY (Mukhyamantri Yuva Swavalamban Yojana)", amount: "Up to ₹50,000", eligibility: "80+ percentile in 12th Science, family income < ₹6 lakhs" },
      { name: "Chief Minister Scholarship", amount: "₹50,000 or 50% tuition fees", eligibility: "Family income < ₹4.5 lakhs" },
      { name: "PRAGATI (for Girl Students)", amount: "₹50,000", eligibility: "Girl students, family income < ₹8 lakhs" },
      { name: "Poor Student Aid", amount: "As decided by management", eligibility: "Family income < ₹3 lakhs" },
    ],
    sports: {
      text: "SVIT hosts a full calendar of sporting events alongside dedicated facilities including a gymnasium, common rooms for boys & girls, and an outdoor playground.",
      activities: [
        { label: "SPANDAN (odd semester)", value: "Chess, Carrom, Push Up, Rope Skipping, Surya Namaskar, Table Tennis, Tug of War, Wrist Fighting" },
        { label: "Annual Sports Meet — Individual", value: "100M, 200M, 400M running, shot put, discus throw, long jump" },
        { label: "Annual Sports Meet — Team", value: "Cricket, Football, Volleyball, Basketball, Hockey, Kabaddi, Kho-Kho" },
      ],
    },
    nssNcc: [
      { name: "NSS (National Service Scheme)", description: "Motto: \"Not Me But You\". Develops personality, leadership, democratic attitude, and nation-building spirit." },
      { name: "NCC (National Cadet Corps)", description: "Develops character, comradeship, discipline, secular outlook, spirit of adventure and ideals of selfless service among youth." },
    ],
    hostelsTransport: {
      hostelText:
        "Separate facilities for boys and girls; neat, clean, spacious, high-security rooms; 24x7 WiFi; girls' hostel includes cooking space and Tiffin services.",
      transportText:
        "Daily bus service on 25 routes from Vadodara to SVIT Vasad.",
    },
    itMedical: [
      { label: "Wi-Fi", description: "24x7 free high-speed internet across campus." },
      { label: "SVIT Data Center", description: "File Server, Software Servers, Intranet website, Linux Server, and E-Library with IIT professor video lectures." },
      { label: "Medical", description: "On-campus health care center with medical officers; works in conjunction with Vasad Primary Health Care Centre." },
      { label: "Life Coach", description: "Mental health support available on campus." },
    ],
  },
  media: {
    intro: "Stay connected with SVIT through various media channels — print, digital, and publications.",
    publications: [
      { name: "Print Media", description: "SVIT features regularly in leading newspapers and publications highlighting achievements, events, and milestones." },
      { name: "Magazine (CONTINUUM)", description: "Annual magazine showcasing student creativity, faculty research, and institutional activities." },
      { name: "Newsletter", description: "Regular newsletters keep stakeholders informed about latest developments, events, and achievements at SVIT." },
    ],
    socialMedia: [
      { platform: "Facebook", url: "https://www.facebook.com/SVIT.Vasad.Official" },
      { platform: "Instagram", url: "https://www.instagram.com/svitvasad_official/" },
      { platform: "LinkedIn", url: "https://www.linkedin.com/school/svitvasad/" },
      { platform: "Twitter", url: "https://twitter.com/SVITOfficial" },
    ],
  },
  contact: {
    address: "Beside GIDC Vasad, Vasad – 388306, Anand, Gujarat, India",
    phone: "+91 2692 274766",
    email: "info@svitvasad.ac.in",
    website: "https://svitvasad.ac.in",
  },
};
