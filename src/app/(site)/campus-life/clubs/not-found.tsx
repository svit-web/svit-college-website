import { NotFoundPanel } from "@/components/site-next/NotFoundPanel";

export default function ClubNotFound() {
  return (
    <NotFoundPanel
      title="Club not available"
      section={{ href: "/campus-life/student-groups", label: "Student groups" }}
      embedded
    />
  );
}
