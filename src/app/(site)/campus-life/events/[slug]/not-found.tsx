import { NotFoundPanel } from "@/components/site-next/NotFoundPanel";

export default function EventNotFound() {
  return (
    <NotFoundPanel
      title="Event not available"
      section={{ href: "/campus-life/events", label: "All events" }}
      embedded
    />
  );
}
