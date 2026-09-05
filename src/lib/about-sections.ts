// Shared list of About SVIT section pages — used by both the header's
// "About SVIT" dropdown and the About pages' own sidebar nav so they can't
// drift out of sync.
export const ABOUT_SECTIONS = [
  { to: "/about/history-vision-mission", label: "History, Vision & Mission" },
  { to: "/about/board-of-management", label: "Board of Management" },
  { to: "/about/chairman-message", label: "Chairman's Message" },
  { to: "/about/principal-message", label: "Principal's Message" },
  { to: "/about/facilities", label: "Central Facilities" },
  { to: "/about/accreditation", label: "Accreditation & Compliance" },
  { to: "/about/committees", label: "SVIT Committees" },
  { to: "/about/media", label: "SVIT Media" },
] as const;
