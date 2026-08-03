import { useEffect, useState } from "react";
import { heroOverlayStyles, type HeroAppearance } from "@/lib/theme.functions";

interface Props {
  photos: string[];
  appearance: HeroAppearance;
  /** Rotate between photos every N ms (e.g. homepage). Omit for a static single photo. */
  rotateMs?: number;
}

/**
 * Photo background + tint/blur overlay shared by every hero that supports an
 * admin-uploaded photo (homepage, college pages, about, campus life, contact).
 * Renders nothing when there are no photos yet, so callers can fall back to
 * their existing plain background.
 */
export function HeroPhotoLayer({ photos, appearance, rotateMs }: Props) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
    if (!rotateMs || photos.length <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % photos.length), rotateMs);
    return () => clearInterval(id);
  }, [photos, rotateMs]);

  if (photos.length === 0) return null;

  const { imageStyle, overlayStyle } = heroOverlayStyles(appearance);
  const activeOpacity = typeof imageStyle.opacity === "number" ? imageStyle.opacity : 1;

  return (
    <>
      {photos.map((src, i) => (
        <img
          key={src + i}
          src={src}
          alt=""
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-in-out"
          style={{ opacity: i === index ? activeOpacity : 0 }}
        />
      ))}
      <div className="absolute inset-0" style={overlayStyle} />
    </>
  );
}
