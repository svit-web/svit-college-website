import { NotFoundPanel } from "@/components/site-next/NotFoundPanel";

export default function CourseFacultyNotFound() {
  return (
    <NotFoundPanel title="Page not found" section={{ href: "/courses", label: "All courses" }} />
  );
}
