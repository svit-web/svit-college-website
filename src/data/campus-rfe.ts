// Central content source for Campus Life leaf/detail pages.
// Any admin backend can swap this file's exports for a fetched payload.

export interface CampusItem {
  slug: string;
  title: string;
  subtitle: string;
  accent: string;
  description: string;
  highlights: { title: string; description: string }[];
  image?: string | null; // placeholder — no AI images
}

// ── Facilities ──────────────────────────────────────────────────────────────
export const academicFacilities: CampusItem[] = [
  {
    slug: "labs",
    title: "Engineering Labs",
    subtitle: "80+ discipline labs",
    accent: "Academic Facility",
    description:
      "Well-equipped engineering laboratories across every department — from software and networking labs to workshops, thermal, structures, VLSI, and process-control labs. Students work on lab manuals, capstone projects and open industry problems.",
    highlights: [
      { title: "80+ labs", description: "Spread across all engineering branches with modern instrumentation." },
      { title: "Project space", description: "Dedicated benches for capstone and hobby projects." },
      { title: "Software licenses", description: "MATLAB, ANSYS, AutoCAD, Xilinx and vendor toolchains." },
      { title: "Safety-first", description: "Trained lab technicians and standard operating procedures." },
    ],
    image: null,
  },
  {
    slug: "ac-smart-classes",
    title: "AC Smart Classrooms",
    subtitle: "Digital-first learning",
    accent: "Academic Facility",
    description:
      "Air-conditioned smart classrooms with interactive displays, digital podiums and campus-wide Wi-Fi. Lectures can be recorded and shared with students for revision.",
    highlights: [
      { title: "Interactive displays", description: "Touch-enabled smart boards in every classroom." },
      { title: "Lecture capture", description: "Recorded lectures accessible on the LMS." },
      { title: "Comfort seating", description: "Ergonomic seating for full-day sessions." },
      { title: "Reliable Wi-Fi", description: "1 Gbps campus network coverage." },
    ],
    image: null,
  },
  {
    slug: "library",
    title: "Central Library",
    subtitle: "30,000+ resources",
    accent: "Academic Facility",
    description:
      "A digital-first central library with 30,000+ titles, subscribed e-journals (IEEE, ASME, Springer, Elsevier) and dedicated reading zones for individual and group study.",
    highlights: [
      { title: "E-resources", description: "IEEE, ASME, Springer, ScienceDirect subscriptions." },
      { title: "Reading zones", description: "Silent, discussion and group-study areas." },
      { title: "Extended hours", description: "Open till late during exam season." },
      { title: "Book-bank", description: "Semester-long textbook loans for eligible students." },
    ],
    image: null,
  },
];

export const sportsFacilities: CampusItem[] = [
  {
    slug: "football",
    title: "Football Ground",
    subtitle: "Full-size turf",
    accent: "Outdoor",
    description: "Full-size football ground used for practice, inter-department leagues and inter-college tournaments.",
    highlights: [
      { title: "Full-size pitch", description: "Regulation dimensions with goalposts and nets." },
      { title: "Coaching", description: "Coach-led practice sessions during the season." },
      { title: "Tournaments", description: "Hosts Sportlon and inter-college fixtures." },
      { title: "Change rooms", description: "Adjacent change rooms and water stations." },
    ],
    image: null,
  },
  {
    slug: "cricket",
    title: "Cricket Ground",
    subtitle: "Practice pitches + nets",
    accent: "Outdoor",
    description: "Cricket ground with turf pitches and dedicated net practice area for batting and bowling drills.",
    highlights: [
      { title: "Turf pitches", description: "Well-maintained pitches for match play." },
      { title: "Net practice", description: "Multiple bowling nets for parallel practice." },
      { title: "Equipment", description: "Bats, pads and kits available from the sports room." },
      { title: "Tournaments", description: "Intra- and inter-college fixtures throughout the year." },
    ],
    image: null,
  },
  {
    slug: "basketball",
    title: "Basketball Court",
    subtitle: "Outdoor synthetic court",
    accent: "Outdoor",
    description: "Full-size outdoor basketball court with flood-lighting for evening practice.",
    highlights: [
      { title: "Synthetic surface", description: "Low-impact playing surface with clear markings." },
      { title: "Flood-lit", description: "Evening practice and matches supported." },
      { title: "Coaching", description: "Weekly coached sessions during the season." },
      { title: "Tournaments", description: "Hosts inter-department tournaments." },
    ],
    image: null,
  },
  {
    slug: "badminton",
    title: "Badminton Courts",
    subtitle: "Indoor wooden courts",
    accent: "Indoor",
    description: "Indoor badminton courts with wooden flooring and adequate lighting for practice and tournaments.",
    highlights: [
      { title: "Wooden flooring", description: "Standard court dimensions with match-grade lighting." },
      { title: "Multiple courts", description: "Concurrent play across multiple courts." },
      { title: "Equipment", description: "Racquets and shuttles available on request." },
      { title: "Tournaments", description: "Regular intra-college fixtures." },
    ],
    image: null,
  },
  {
    slug: "pickle",
    title: "Pickleball Court",
    subtitle: "Fast-growing racquet sport",
    accent: "Outdoor",
    description: "Dedicated pickleball court supporting the fastest-growing racquet sport on campus.",
    highlights: [
      { title: "Regulation court", description: "Standard court markings and net." },
      { title: "Beginner-friendly", description: "Easy to pick up for new players." },
      { title: "Equipment", description: "Paddles and balls available." },
      { title: "Growing community", description: "Weekly informal meets." },
    ],
    image: null,
  },
  {
    slug: "volley",
    title: "Volleyball Court",
    subtitle: "Sand & hard courts",
    accent: "Outdoor",
    description: "Volleyball facilities with both sand and hard-court options for casual and competitive play.",
    highlights: [
      { title: "Two surfaces", description: "Sand and hard-court variants available." },
      { title: "Practice sessions", description: "Coach-led drills during the season." },
      { title: "Equipment", description: "Balls and nets managed by the sports room." },
      { title: "Tournaments", description: "Frequent inter-department matches." },
    ],
    image: null,
  },
  {
    slug: "chess",
    title: "Chess Room",
    subtitle: "Quiet indoor space",
    accent: "Indoor",
    description: "Dedicated chess room with boards, clocks and quiet study atmosphere for tournament practice.",
    highlights: [
      { title: "Boards & clocks", description: "Tournament-grade equipment." },
      { title: "Quiet zone", description: "Distraction-free environment." },
      { title: "Tournaments", description: "Regular intra-college blitz and rapid events." },
      { title: "Coaching", description: "Peer-led openings and endgame sessions." },
    ],
    image: null,
  },
  {
    slug: "table-tennis",
    title: "Table Tennis",
    subtitle: "Multi-table indoor hall",
    accent: "Indoor",
    description: "Indoor hall with multiple TT tables for concurrent practice and doubles matches.",
    highlights: [
      { title: "Multiple tables", description: "Concurrent practice for many players." },
      { title: "Equipment", description: "Bats and balls available on request." },
      { title: "Coaching", description: "Weekly coached sessions." },
      { title: "Tournaments", description: "Singles and doubles fixtures round the year." },
    ],
    image: null,
  },
  {
    slug: "carrom",
    title: "Carrom Room",
    subtitle: "Recreational lounge",
    accent: "Indoor",
    description: "Recreational carrom lounge for informal play between classes and during hostel evenings.",
    highlights: [
      { title: "Multiple boards", description: "Concurrent play for many students." },
      { title: "Casual play", description: "Open access during college hours." },
      { title: "Tournaments", description: "Inter-department tournaments during Sportlon." },
      { title: "Equipment", description: "Boards, strikers and coins managed by sports room." },
    ],
    image: null,
  },
  {
    slug: "weightlifting",
    title: "Weightlifting & Gym",
    subtitle: "Strength & conditioning",
    accent: "Indoor",
    description: "Campus gym with weightlifting, cardio and functional-training equipment supervised by trained staff.",
    highlights: [
      { title: "Full range", description: "Free weights, machines and cardio equipment." },
      { title: "Supervised", description: "Trained instructors on floor during peak hours." },
      { title: "Structured plans", description: "Beginner-to-advanced training routines." },
      { title: "Safety", description: "Safety protocols and spotters for heavy lifts." },
    ],
    image: null,
  },
];

// ── Co-curricular Centres ───────────────────────────────────────────────────
export const centreDetails: CampusItem[] = [
  {
    slug: "gdg",
    title: "Google Developer Groups (GDG)",
    subtitle: "Student-led Google technologies chapter",
    accent: "Centre",
    description:
      "The GDG chapter at SVIT runs study jams, DevFests and workshops on Google technologies — Android, Firebase, Cloud, Flutter and Web.",
    highlights: [
      { title: "Study jams", description: "Regular hands-on sessions on Google tech." },
      { title: "DevFest", description: "Annual community developer festival." },
      { title: "Mentorship", description: "Alumni & industry mentors from Google ecosystem partners." },
      { title: "Certifications", description: "Guidance for Google Cloud and Android certifications." },
    ],
    image: null,
  },
  {
    slug: "coe",
    title: "Centre of Excellence (CoE)",
    subtitle: "Applied research & industry projects",
    accent: "Centre",
    description:
      "The Centre of Excellence hosts advanced project work with industry partners in areas like AI, IoT, sustainability and cyber-security.",
    highlights: [
      { title: "Industry projects", description: "Live problems from partner companies." },
      { title: "Advanced labs", description: "Access to specialised hardware and software." },
      { title: "Research", description: "Publication and patent support." },
      { title: "Student fellowships", description: "Selected students work as research assistants." },
    ],
    image: null,
  },
  {
    slug: "iste-student",
    title: "ISTE Student Chapter",
    subtitle: "Indian Society for Technical Education",
    accent: "Centre",
    description:
      "Student chapter of ISTE — organises technical talks, workshops and student conferences that build wider engineering community.",
    highlights: [
      { title: "Technical talks", description: "Guest lectures from academia and industry." },
      { title: "Workshops", description: "Hands-on sessions across disciplines." },
      { title: "Student conferences", description: "Paper presentations and poster events." },
      { title: "Networking", description: "Connect with other ISTE chapters nationwide." },
    ],
    image: null,
  },
  {
    slug: "iste-faculty",
    title: "ISTE Faculty Chapter",
    subtitle: "Faculty development & pedagogy",
    accent: "Centre",
    description: "Faculty chapter that drives Faculty Development Programmes (FDPs), pedagogy workshops and academic research collaborations.",
    highlights: [
      { title: "FDPs", description: "Regular AICTE- and university-approved FDPs." },
      { title: "Pedagogy", description: "Modern teaching-learning workshops." },
      { title: "Research", description: "Collaborative research and publications." },
      { title: "Awards", description: "Best-teacher and research recognitions." },
    ],
    image: null,
  },
  {
    slug: "sc-ist",
    title: "SC/ST Cell",
    subtitle: "Inclusive support & mentoring",
    accent: "Centre",
    description: "The SC/ST Cell ensures inclusive support, scholarships, mentoring and grievance redressal for SC/ST students on campus.",
    highlights: [
      { title: "Scholarships", description: "Assistance with government scholarships and forms." },
      { title: "Mentoring", description: "Academic and personal mentoring." },
      { title: "Grievance redressal", description: "Confidential support channel." },
      { title: "Awareness", description: "Regular awareness and inclusion sessions." },
    ],
    image: null,
  },
  {
    slug: "iipc",
    title: "Industry-Institute Partnership Cell (IIPC)",
    subtitle: "Industry engagement",
    accent: "Centre",
    description: "IIPC drives industry engagement — MOUs, expert lectures, industrial visits, internships and consultancy projects.",
    highlights: [
      { title: "MOUs", description: "Formal partnerships with industry leaders." },
      { title: "Internships", description: "Structured internship pipelines." },
      { title: "Consultancy", description: "Consulting projects for partner companies." },
      { title: "Expert lectures", description: "Regular sessions from senior industry professionals." },
    ],
    image: null,
  },
  {
    slug: "edc",
    title: "Entrepreneurship Development Cell (EDC)",
    subtitle: "Startup mentorship & incubation",
    accent: "Centre",
    description: "EDC mentors student entrepreneurs from ideation to pitch — with incubation support, mentor networks and pitch events.",
    highlights: [
      { title: "Ideation", description: "Design-thinking and ideation sprints." },
      { title: "Mentorship", description: "Founders and investors on the mentor panel." },
      { title: "Incubation", description: "Physical incubation space and infrastructure." },
      { title: "Pitch events", description: "Demo days and investor connect." },
    ],
    image: null,
  },
  {
    slug: "ssip",
    title: "Student Startup & Innovation Policy (SSIP)",
    subtitle: "Government-backed innovation grants",
    accent: "Centre",
    description: "SSIP supports student innovators with grants, IP support and access to state-level startup schemes.",
    highlights: [
      { title: "Grants", description: "Seed grants for student innovators." },
      { title: "IP support", description: "Patent and copyright filing assistance." },
      { title: "State schemes", description: "Access to state startup and innovation policies." },
      { title: "Prototyping", description: "Prototyping labs and tools." },
    ],
    image: null,
  },
];

// ── Clubs ───────────────────────────────────────────────────────────────────
export const clubDetails: CampusItem[] = [
  {
    slug: "praxis",
    title: "Praxis",
    subtitle: "Hands-on maker workshops",
    accent: "Club",
    description: "Praxis runs hands-on workshops across making, prototyping, embedded systems and creative engineering.",
    highlights: [
      { title: "Workshops", description: "Weekend hands-on making sessions." },
      { title: "Maker space", description: "Access to tools and prototyping equipment." },
      { title: "Projects", description: "Team-driven build projects." },
      { title: "Showcases", description: "Public demo days each semester." },
    ],
    image: null,
  },
  {
    slug: "aims",
    title: "AIMS Club",
    subtitle: "Applied information & management",
    accent: "Club",
    description: "AIMS focuses on applied information management — data, analytics, business intelligence and information systems.",
    highlights: [
      { title: "Data sessions", description: "Practical analytics and BI workshops." },
      { title: "Case studies", description: "Real information-management case work." },
      { title: "Speaker series", description: "Industry speakers on IT and management." },
      { title: "Competitions", description: "Analytics and case competitions." },
    ],
    image: null,
  },
  {
    slug: "apexia",
    title: "Apexia",
    subtitle: "Technical innovation collective",
    accent: "Club",
    description: "Apexia is a technical innovation collective — cross-department teams working on innovation and R&D projects.",
    highlights: [
      { title: "Innovation projects", description: "Cross-department R&D and innovation." },
      { title: "Hackathons", description: "Participation in national hackathons." },
      { title: "Mentorship", description: "Faculty and alumni mentors." },
      { title: "Showcases", description: "Public demo days and expos." },
    ],
    image: null,
  },
  {
    slug: "circutx",
    title: "CircuitX",
    subtitle: "Electronics & circuit design",
    accent: "Club",
    description: "CircuitX focuses on electronics, embedded design, PCB prototyping and circuit-level projects.",
    highlights: [
      { title: "PCB design", description: "Design and fabrication workshops." },
      { title: "Embedded projects", description: "Microcontroller and IoT builds." },
      { title: "Competitions", description: "Circuit design and robotics contests." },
      { title: "Peer learning", description: "Weekly build & debug sessions." },
    ],
    image: null,
  },
];

// ── Events ──────────────────────────────────────────────────────────────────
export const eventDetails: CampusItem[] = [
  {
    slug: "tedx",
    title: "TEDx SVIT Vasad",
    subtitle: "Ideas worth spreading",
    accent: "Event",
    description: "TEDx SVIT Vasad brings speakers from science, arts, industry and civic life to share ideas that matter.",
    highlights: [
      { title: "Speaker line-up", description: "Curated speakers across disciplines." },
      { title: "Community", description: "Open to students, faculty and public audiences." },
      { title: "Live sessions", description: "Live talks and interactive Q&A." },
      { title: "Archives", description: "Talks published on TEDx channels." },
    ],
    image: null,
  },
  {
    slug: "spark",
    title: "Spandan",
    subtitle: "Cultural pulse of campus",
    accent: "Event",
    description: "Spandan captures the cultural pulse of SVIT — music, dance, drama and open-mic across two vibrant days.",
    highlights: [
      { title: "Cultural nights", description: "Music, dance and drama competitions." },
      { title: "Open mic", description: "Poetry, standup and spoken-word slots." },
      { title: "Food carnival", description: "Cuisine stalls across the campus greens." },
      { title: "Alumni return", description: "Alumni meet as part of the fest." },
    ],
    image: null,
  },
  {
    slug: "prakarsh",
    title: "Prakarsh — Techfest & Talkfest",
    subtitle: "Tech, talks and competitions",
    accent: "Event",
    description: "Prakarsh is SVIT's flagship tech and talkfest — hackathons, project expos, technical talks and workshops.",
    highlights: [
      { title: "Hackathons", description: "Multi-track hackathons over two days." },
      { title: "Project expo", description: "Student and industry project showcases." },
      { title: "Talkfest", description: "Panels and lectures from industry leaders." },
      { title: "Workshops", description: "Skill-building workshops with take-away kits." },
    ],
    image: null,
  },
  {
    slug: "malhar",
    title: "Malhar — Annual Day",
    subtitle: "Celebrating a year of SVIT",
    accent: "Event",
    description: "Malhar is SVIT's annual day — celebrating student achievements, faculty milestones and campus community.",
    highlights: [
      { title: "Awards", description: "Recognitions for students, faculty and staff." },
      { title: "Performances", description: "Cultural performances from student clubs." },
      { title: "Chief guest", description: "Guest of honour address." },
      { title: "Community", description: "Open to parents, alumni and partners." },
    ],
    image: null,
  },
];

// Convenience maps + helpers ────────────────────────────────────────────────
const byMap = <T extends { slug: string }>(items: T[]) =>
  Object.fromEntries(items.map((i) => [i.slug, i])) as Record<string, T>;

export const facilityIndex = {
  academic: byMap(academicFacilities),
  sports: byMap(sportsFacilities),
};

export const centreMap = byMap(centreDetails);
export const clubMap = byMap(clubDetails);
export const eventMap = byMap(eventDetails);

/**
 * Resolve a facility leaf item from a URL splat like:
 *   academic/labs
 *   co-curriculum/football
 *   co-curriculum/ground/football
 *   co-curriculum/sportsroom/chess
 * Returns undefined if the path does not point at a known leaf.
 */
export function resolveFacilityLeaf(splat: string): CampusItem | undefined {
  const parts = splat.split("/").filter(Boolean);
  if (parts.length === 0) return undefined;
  const [top, ...rest] = parts;
  if (top === "academic") {
    const slug = rest[0];
    return slug ? facilityIndex.academic[slug] : undefined;
  }
  if (top === "co-curriculum") {
    // Support both flat (/co-curriculum/football) and nested
    // (/co-curriculum/ground/football, /co-curriculum/sportsroom/chess)
    const last = rest[rest.length - 1];
    return last ? facilityIndex.sports[last] : undefined;
  }
  return undefined;
}
