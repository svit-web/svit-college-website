import { NotFoundPanel } from "@/components/site-next/NotFoundPanel";

export default function EngDeptNotFound() {
  return (
    <NotFoundPanel
      title="Department not found"
      section={{ href: "/colleges", label: "Colleges & departments" }}
    />
  );
}
