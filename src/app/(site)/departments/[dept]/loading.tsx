import { PageSkeleton } from "@/components/site-next/PageSkeleton";

// Inside the department layout, so its tabs stay on screen around this.
export default function Loading() {
  return <PageSkeleton inset={false} />;
}
