import { NotFoundPanel } from "@/components/site-next/NotFoundPanel";

export default function AchievementNotFound() {
  return (
    <NotFoundPanel
      title="Achievement not found"
      message="The achievement you're looking for doesn't exist or doesn't have its own page."
    />
  );
}
