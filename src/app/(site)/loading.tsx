import { PageSkeleton } from "@/components/site-next/PageSkeleton";

// Shown automatically by Next.js while a navigated-to page's server data is
// still streaming in (see loading.js docs). Covers every route under the
// (site) group that has no closer loading.tsx. The Header/Footer in layout.tsx
// aren't part of this Suspense boundary, so they stay put and interactive.
export default function Loading() {
  return <PageSkeleton />;
}
