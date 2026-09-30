import { NotFoundPanel } from "@/components/site-next/NotFoundPanel";

export default function FacilityNotFound() {
  return (
    <NotFoundPanel
      title="Facility not available"
      message="The facility you are looking for does not exist yet."
      section={{ href: "/campus-life/facilities", label: "All facilities" }}
      embedded
    />
  );
}
