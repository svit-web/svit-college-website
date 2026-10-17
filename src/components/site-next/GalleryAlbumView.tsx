"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence } from "framer-motion";
import { PageHero } from "./PageHero";
import { Reveal } from "./Reveal";
import { PhotoLightbox } from "./PhotoLightbox";
import type { GalleryAlbumWithMedia, GalleryMedia } from "@/lib/gallery.functions";

export function GalleryAlbumView({ album }: { album: GalleryAlbumWithMedia }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  return (
    <div>
      <PageHero
        title={album.title}
        accent="Gallery"
        subtitle={album.description ?? undefined}
        crumbs={[
          { label: "Home", to: "/" },
          { label: "Gallery", to: "/gallery" },
          { label: album.title },
        ]}
      >
        <span className="rounded-full border border-line-strong px-4 py-2 text-xs font-semibold uppercase tracking-wider text-ink-soft">
          {album.media.length} photos
        </span>
      </PageHero>

      {/* Photo grid */}
      <div className="container-page py-[clamp(48px,6vw,80px)]">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {album.media.map((img: GalleryMedia, i: number) => (
            <Reveal key={img.id} delay={i * 0.015}>
              <button
                aria-label={`View ${img.caption || `photo ${i + 1}`} full screen`}
                className="group relative block aspect-square w-full overflow-hidden bg-paper-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-navy"
                onClick={() => setLightboxIndex(i)}
              >
                <Image
                  src={img.url}
                  alt={img.caption || album.title}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-ink/0 transition-colors group-hover:bg-ink/15" />
              </button>
            </Reveal>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <PhotoLightbox
            images={album.media}
            index={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
            onChange={setLightboxIndex}
            label={album.title}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
