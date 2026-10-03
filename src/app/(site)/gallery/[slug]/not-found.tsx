import { NotFoundPanel } from "@/components/site-next/NotFoundPanel";

export default function AlbumNotFound() {
  return (
    <NotFoundPanel title="Album not found" section={{ href: "/gallery", label: "All albums" }} />
  );
}
