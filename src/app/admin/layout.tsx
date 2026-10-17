import type { Metadata } from "next";

// Keeps every admin route (login included) out of search results; robots.ts
// also disallows /admin, but that alone doesn't stop indexing of linked URLs.
export const metadata: Metadata = {
  title: "Admin — SVIT Vasad",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
