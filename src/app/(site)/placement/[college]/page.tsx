import { redirect } from "next/navigation";

// Placements are presented as a single unified page. Per-college URLs are kept
// so existing links and search results don't 404 — they land on /placement.
export default function PlacementCollegeRedirect() {
  redirect("/placement");
}
