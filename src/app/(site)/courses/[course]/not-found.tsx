import { NotFoundPanel } from "@/components/site-next/NotFoundPanel";

export default function CourseNotFound() {
  return (
    <NotFoundPanel title="Course not found" section={{ href: "/courses", label: "All courses" }} />
  );
}
