import { NotFoundPanel } from "@/components/site-next/NotFoundPanel";

export default function DeptNotFound() {
  return (
    <NotFoundPanel
      title="Department not found"
      message="The department you're looking for doesn't exist."
      section={{ href: "/colleges", label: "Colleges & departments" }}
    />
  );
}
