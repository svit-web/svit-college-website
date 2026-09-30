import { NotFoundPanel } from "@/components/site-next/NotFoundPanel";

export default function ProgramNotFound() {
  return (
    <NotFoundPanel title="Program not found" section={{ href: "/courses", label: "All courses" }} />
  );
}
