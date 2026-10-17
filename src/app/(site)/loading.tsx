// Shown automatically by Next.js while a navigated-to page's server data is
// still streaming in (see loading.js docs). Covers every route under the
// (site) group from this one file. The Header/Footer in layout.tsx aren't
// part of this Suspense boundary, so they stay put and interactive — only
// this thin bar appears, fading in after a delay so fast navigations (the
// common case) never see it at all.
export default function Loading() {
  return <div aria-hidden className="route-progress" />;
}
