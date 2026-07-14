// Hero highlight cards shown in the homepage hero slider.
// TODO: Replace placeholder images/captions with real photos.
// This data structure mirrors what a future backend/API would return —
// components should map over `heroHighlights` and stay markup-free of any
// hardcoded slide, so adding/removing/reordering photos is a data-only change.

export interface HeroHighlight {
  id: string;
  image: string;      // absolute URL or imported asset URL
  eyebrow?: string;   // small label above the title
  title: string;      // main caption
  subtitle?: string;  // optional supporting line
}

export const heroHighlights: HeroHighlight[] = [
  {
    id: "campus",
    image: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80",
    eyebrow: "Campus",
    title: "15+ Acre Green Campus",
    subtitle: "Modern academic blocks & landscaped grounds",
  },
  {
    id: "labs",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80",
    eyebrow: "Facilities",
    title: "Advanced Labs & Workshops",
    subtitle: "Industry-grade equipment across departments",
  },
  {
    id: "library",
    image: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80",
    eyebrow: "Learning",
    title: "Digital Library",
    subtitle: "50,000+ books and online journals",
  },
  {
    id: "life",
    image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80",
    eyebrow: "Student Life",
    title: "Events, Clubs & Sports",
    subtitle: "A vibrant campus culture",
  },
];
