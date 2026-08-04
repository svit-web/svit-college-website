import { createFileRoute, redirect } from "@tanstack/react-router";

// Placements are presented as a single unified page. Per-college URLs are kept
// so existing links and search results don't 404 — they land on /placement.
export const Route = createFileRoute("/placement/$college")({
  beforeLoad: () => {
    throw redirect({ to: "/placement" });
  },
});
