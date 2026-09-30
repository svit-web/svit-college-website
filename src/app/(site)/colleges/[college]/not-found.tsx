import { NotFoundPanel } from "@/components/site-next/NotFoundPanel";

export default function CollegeNotFound() {
  return (
    <NotFoundPanel
      title="College not found"
      message="The college you're looking for doesn't exist."
      section={{ href: "/colleges", label: "All colleges" }}
    />
  );
}
