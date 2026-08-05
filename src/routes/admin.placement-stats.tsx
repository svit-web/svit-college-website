import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/placement-stats")({
  beforeLoad: () => { throw redirect({ to: "/admin/tnp-hub" }); },
  component: () => null,
});
