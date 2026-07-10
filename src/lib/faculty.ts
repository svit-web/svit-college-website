export interface FacultyMember {
  name: string;
  title: string;
  qualification: string;
  specialization: string;
  experience: string;
  email: string;
  initials: string;
}

const firstNames = ["Amit", "Priya", "Rajesh", "Neha", "Sanjay", "Kavita", "Vikram", "Anjali", "Rahul", "Meera", "Suresh", "Pooja", "Nikhil", "Divya", "Manish", "Ritu"];
const lastNames = ["Patel", "Shah", "Sharma", "Desai", "Mehta", "Joshi", "Kapoor", "Verma", "Iyer", "Nair", "Trivedi", "Chauhan", "Raval", "Bhatt"];
const titles = ["Professor & HoD", "Professor", "Associate Professor", "Assistant Professor"];
const quals = ["Ph.D.", "M.Tech, Ph.D.", "M.E., Ph.D. (pursuing)", "M.Tech"];

function fnv1a(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
  }
  return h >>> 0;
}

export function getFaculty(slug: string, specialisations: string[], count = 8): FacultyMember[] {
  const out: FacultyMember[] = [];
  for (let i = 0; i < count; i++) {
    const seed = fnv1a(`${slug}-${i}`);
    const fn = firstNames[seed % firstNames.length];
    const ln = lastNames[(seed >> 4) % lastNames.length];
    const title = titles[i === 0 ? 0 : ((seed >> 8) % (titles.length - 1)) + 1];
    const qual = quals[(seed >> 12) % quals.length];
    const spec = specialisations[(seed >> 16) % specialisations.length];
    const exp = `${5 + ((seed >> 20) % 20)}+ yrs`;
    const email = `${fn.toLowerCase()}.${ln.toLowerCase()}@svitvasad.ac.in`;
    out.push({
      name: `Dr. ${fn} ${ln}`,
      title, qualification: qual, specialization: spec, experience: exp, email,
      initials: `${fn[0]}${ln[0]}`,
    });
  }
  return out;
}
