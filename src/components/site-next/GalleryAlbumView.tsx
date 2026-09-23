"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence } from "framer-motion";
import { Reveal } from "./Reveal";
import { PhotoLightbox } from "./PhotoLightbox";
import type { GalleryAlbumWithMedia, GalleryMedia } from "@/lib/gallery.functions";
import { ArrowLeft } from "lucide-react";

export function GalleryAlbumView({ album }: { album: GalleryAlbumWithMedia }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  return (
    <div>
      {/* Header */}
      <section className="bg-gradient-to-br from-navy via-navy to-navy-deep pb-12 pt-[clamp(150px,18vh,200px)] text-white">
        <div className="container-page">
          <Link
            href="/gallery"
            className="mb-4 inline-flex items-center gap-2 text-sm text-white/60 hover:text-gold transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> All Albums
          </Link>
          <h1 className="mt-2 font-display text-3xl font-bold md:text-4xl">{album.title}</h1>
          {album.description && <p className="mt-3 max-w-2xl text-white/70">{album.description}</p>}
          <div className="mt-4 text-sm text-white/50">{album.media.length} photos</div>
        </div>
      </section>

      {/* Photo grid */}
      <div className="container-page py-12">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {album.media.map((img: GalleryMedia, i: number) => (
            <Reveal key={img.id} delay={i * 0.015}>
              <button
                className="group relative aspect-square w-full overflow-hidden rounded-xl bg-navy/5 active:scale-[0.97] transition-transform duration-75"
                onClick={() => setLightboxIndex(i)}
              >
                <Image
                  src={img.url}
                  alt={img.caption || album.title}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20 rounded-xl" />
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
