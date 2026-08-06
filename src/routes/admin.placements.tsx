import { createFileRoute, redirect } from "@tanstack/react-router";

// Placement admin is a single unified hub. Old links to this URL are kept
// working by redirecting to /admin/tnp-hub instead of 404ing.
export const Route = createFileRoute("/admin/placements")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/tnp-hub" });
  },
});
