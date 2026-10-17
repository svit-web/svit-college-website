import { NotFoundPanel } from "@/components/site-next/NotFoundPanel";

export default function StaffNotFound() {
  return (
    <NotFoundPanel
      title="Staff profile not found"
      message="The staff member you're looking for doesn't exist or is no longer active."
      section={{ href: "/colleges", label: "Colleges & departments" }}
    />
  );
}
