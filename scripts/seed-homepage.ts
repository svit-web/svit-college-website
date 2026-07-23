/**
 * Seed script to populate homepage_items table with static data
 * Run with: VITE_SUPABASE_URL=xxx VITE_SUPABASE_PUBLISHABLE_KEY=xxx npx tsx scripts/seed-homepage.ts
 */

import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/integrations/supabase/types";

const supabaseUrl = "https://mzlvjgtsrepzxynntbtt.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16bHZqZ3RzcmVwenh5bm50YnR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQzNTY4ODEsImV4cCI6MjA5OTkzMjg4MX0.X4z09Gkbn7rt1akC33bW6RxPVbmOpqCNq9EWd6tOmwo";

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient<Database>(supabaseUrl, supabaseKey);

// Static data from src/data/site.ts
const stats = [
  { value: "20+", label: "Years of Excellence" },
  { value: "5000+", label: "Students" },
  { value: "100+", label: "Faculty Members" },
  { value: "15+", label: "Acre Green Campus" },
  { value: "95%", label: "Placement Record" },
  { value: "200+", label: "Recruiting Partners" },
];

const whyChoose = [
  { title: "AICTE-approved programmes", desc: "Nationally recognised curriculum aligned with industry standards.", icon: "BadgeCheck" },
  { title: "Experienced faculty", desc: "100+ senior mentors with academic and industry backgrounds.", icon: "GraduationCap" },
  { title: "Strong placement record", desc: "95%+ placement across engineering, MBA and MCA programmes.", icon: "Briefcase" },
  { title: "Modern infrastructure", desc: "Well-equipped labs, digital library and innovation centres.", icon: "Building2" },
  { title: "Vibrant campus life", desc: "50+ clubs, sports and cultural fests all year round.", icon: "Users" },
  { title: "Research & innovation", desc: "Funded projects, patents and startup incubation support.", icon: "Lightbulb" },
];

const trustBadges = [
  "AICTE Approved",
  "NAAC Accredited",
  "5000+ Students",
  "15+ Acre Campus"
];

// From src/data/heroHighlights.ts
const heroHighlights = [
  {
    image: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80",
    eyebrow: "Campus",
    title: "15+ Acre Green Campus",
    subtitle: "Modern academic blocks & landscaped grounds"
  },
  {
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80",
    eyebrow: "Facilities",
    title: "Advanced Labs & Workshops",
    subtitle: "Industry-grade equipment across departments"
  },
  {
    image: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80",
    eyebrow: "Learning",
    title: "Digital Library",
    subtitle: "50,000+ books and online journals"
  },
  {
    image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80",
    eyebrow: "Student Life",
    title: "Events, Clubs & Sports",
    subtitle: "A vibrant campus culture"
  }
];

const quickLinks = [
  { label: "Engineering", href: "/courses/engineering" },
  { label: "Architecture", href: "/courses/architecture" },
  { label: "MBA", href: "/courses/mba" },
  { label: "MCA", href: "/courses/mca" },
  { label: "B.Sc", href: "/courses/bsc" },
  { label: "BBA", href: "/courses/bba" },
  { label: "Diploma", href: "/courses/diploma" },
];

async function seedHomepage() {
  console.log("🌱 Seeding homepage data...\n");

  // 1. Hero section
  console.log("📍 Inserting hero...");
  const { error: heroError } = await supabase.from("homepage_items").insert({
    item_type: "hero",
    scope_type: "global",
    eyebrow: "Est. 2005 · Vasad, Gujarat",
    title: "Build Your Future.",
    title_accent: "Shape The World.",
    subtitle: "SVIT Vasad is a premier institute offering AICTE-approved programmes in engineering, management and applied sciences with 95%+ placement across 200+ recruiting partners.",
    image_url: "/assets/campus-hero.jpg",
    link_label: "Apply Now",
    link_href: "/admissions/inquiry",
    secondary_link_label: "Explore Courses",
    secondary_link_href: "/courses",
    is_active: true,
    status: "published",
    sort_order: 0,
  });
  if (heroError) console.error("Hero error:", heroError);
  else console.log("✅ Hero inserted\n");

  // 2. Quick links
  console.log("📍 Inserting quick links...");
  const quickLinkItems = quickLinks.map((link, i) => ({
    item_type: "quick_link",
    scope_type: "global" as const,
    title: link.label,
    link_href: link.href,
    is_active: true,
    status: "published" as const,
    sort_order: i,
  }));
  const { error: quickError } = await supabase.from("homepage_items").insert(quickLinkItems);
  if (quickError) console.error("Quick links error:", quickError);
  else console.log(`✅ ${quickLinks.length} quick links inserted\n`);

  // 3. Highlight cards
  console.log("📍 Inserting highlight cards...");
  const highlightItems = heroHighlights.map((h, i) => ({
    item_type: "highlight_card",
    scope_type: "global" as const,
    eyebrow: h.eyebrow,
    title: h.title,
    subtitle: h.subtitle,
    image_url: h.image,
    is_active: true,
    status: "published" as const,
    sort_order: i,
  }));
  const { error: highlightError } = await supabase.from("homepage_items").insert(highlightItems);
  if (highlightError) console.error("Highlights error:", highlightError);
  else console.log(`✅ ${heroHighlights.length} highlight cards inserted\n`);

  // 4. Stats
  console.log("📍 Inserting stats...");
  const statItems = stats.map((s, i) => ({
    item_type: "stat",
    scope_type: "global" as const,
    title: s.value,
    subtitle: s.label,
    is_active: true,
    status: "published" as const,
    sort_order: i,
  }));
  const { error: statError } = await supabase.from("homepage_items").insert(statItems);
  if (statError) console.error("Stats error:", statError);
  else console.log(`✅ ${stats.length} stats inserted\n`);

  // 5. Why choose cards
  console.log("📍 Inserting why choose cards...");
  const whyItems = whyChoose.map((w, i) => ({
    item_type: "why_choose",
    scope_type: "global" as const,
    title: w.title,
    body: w.desc,
    icon_name: w.icon,
    is_active: true,
    status: "published" as const,
    sort_order: i,
  }));
  const { error: whyError } = await supabase.from("homepage_items").insert(whyItems);
  if (whyError) console.error("Why choose error:", whyError);
  else console.log(`✅ ${whyChoose.length} why choose cards inserted\n`);

  // 6. Trust badges
  console.log("📍 Inserting trust badges...");
  const badgeItems = trustBadges.map((badge, i) => ({
    item_type: "trust_badge",
    scope_type: "global" as const,
    title: badge,
    is_active: true,
    status: "published" as const,
    sort_order: i,
  }));
  const { error: badgeError } = await supabase.from("homepage_items").insert(badgeItems);
  if (badgeError) console.error("Trust badges error:", badgeError);
  else console.log(`✅ ${trustBadges.length} trust badges inserted\n`);

  // 7. Admissions promo card
  console.log("📍 Inserting admissions promo...");
  const { error: promoError } = await supabase.from("homepage_items").insert({
    item_type: "promo_card",
    scope_type: "global",
    eyebrow: "Admissions Open",
    title: "Your future starts here",
    body: "Join 5000+ students building careers with SVIT. Merit-based scholarships, hostel accommodation, and dedicated placement support.",
    link_label: "View Admissions",
    link_href: "/admissions",
    is_active: true,
    status: "published",
    sort_order: 0,
    metadata: { slot: "home_admissions" },
  });
  if (promoError) console.error("Promo error:", promoError);
  else console.log("✅ Admissions promo inserted\n");

  console.log("✅ Homepage seeding complete!");
}

seedHomepage().catch(console.error);
