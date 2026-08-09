import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AnimatePresence, motion, useMotionValue, useTransform, type PanInfo } from "framer-motion";
import { Reveal } from "@/components/site/Reveal";
import { getGalleryAlbumWithMedia } from "@/lib/gallery.functions";
import type { GalleryMedia } from "@/lib/gallery.functions";
import { ChevronLeft, ChevronRight, X, ArrowLeft } from "lucide-react";

function AlbumSkeleton() {
  return (
    <div>
      <section className="bg-gradient-to-br from-navy via-navy to-navy-deep py-12 text-white">
        <div className="container-page">
          <div className="h-4 w-24 rounded bg-white/20 animate-pulse mb-4" />
          <div className="h-9 w-64 rounded bg-white/20 animate-pulse" />
          <div className="mt-3 h-4 w-96 rounded bg-white/10 animate-pulse" />
        </div>
      </section>
      <div className="container-page py-12">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aspect-square w-full rounded-xl bg-navy/8 animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/gallery/$albumId")({
  loader: async ({ params }) => {
    const album = await getGalleryAlbumWithMedia({ data: params.albumId });
    if (!album) throw new Error("Album not found");
    return { album };
  },
  pendingComponent: AlbumSkeleton,
  component: AlbumPage,
});

function Lightbox({
  images,
  index,
  onClose,
  onChange,
}: {
  images: GalleryMedia[];
  index: number;
  onClose: () => void;
  onChange: (i: number) => void;
}) {
  const img = images[index];
  const dragY = useMotionValue(0);
  const bgOpacity = useTransform(dragY, [-200, 0, 200], [0, 0.9, 0]);

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowLeft" && index > 0) onChange(index - 1);
    if (e.key === "ArrowRight" && index < images.length - 1) onChange(index + 1);
    if (e.key === "Escape") onClose();
  }

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (Math.abs(info.offset.y) > 80 || Math.abs(info.velocity.y) > 500) {
      onClose();
    } else {
      dragY.set(0);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ type: "spring", bounce: 0, duration: 0.25 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      onKeyDown={handleKey}
      tabIndex={0}
      // eslint-disable-next-line jsx-a11y/no-autofocus
      autoFocus
    >
      {/* Background — dims with drag distance */}
      <motion.div
        className="absolute inset-0 bg-black"
        style={{ opacity: bgOpacity }}
        onClick={onClose}
      />

      {/* Close */}
      <button
        className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 active:scale-90 transition-[background-color] duration-150"
        onClick={onClose}
        aria-label="Close"
      >
        <X className="h-6 w-6" />
      </button>

      {/* Prev */}
      <button
        className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 active:scale-90 transition-[background-color] duration-150 disabled:opacity-20"
        onClick={(e) => { e.stopPropagation(); onChange(index - 1); }}
        disabled={index === 0}
        aria-label="Previous"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>

      {/* Draggable image — swipe up/down to dismiss */}
      <motion.div
        style={{ y: dragY }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.25}
        onDragEnd={handleDragEnd}
        className="relative z-10 cursor-grab active:cursor-grabbing"
        onClick={(e) => e.stopPropagation()}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.img
            key={img.url}
            src={img.url}
            alt={img.caption || ""}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ type: "spring", bounce: 0, duration: 0.25 }}
            className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain pointer-events-none select-none"
          />
        </AnimatePresence>
      </motion.div>

      {/* Next */}
      <button
        className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 active:scale-90 transition-[background-color] duration-150 disabled:opacity-20"
        onClick={(e) => { e.stopPropagation(); onChange(index + 1); }}
        disabled={index === images.length - 1}
        aria-label="Next"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Counter */}
      <div className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-full bg-black/40 px-4 py-1.5 text-sm text-white/80">
        {index + 1} / {images.length}
      </div>
    </motion.div>
  );
}

function AlbumPage() {
  const { album } = Route.useLoaderData();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  return (
    <div>
      {/* Header */}
      <section className="bg-gradient-to-br from-navy via-navy to-navy-deep py-12 text-white">
        <div className="container-page">
          <Link
            to="/gallery"
            className="mb-4 inline-flex items-center gap-2 text-sm text-white/60 hover:text-gold transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> All Albums
          </Link>
          <h1 className="mt-2 font-display text-3xl font-bold md:text-4xl">{album.title}</h1>
          {album.description && (
            <p className="mt-3 max-w-2xl text-white/70">{album.description}</p>
          )}
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
                <img
                  src={img.url}
                  alt={img.caption || album.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
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
          <Lightbox
            images={album.media}
            index={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
            onChange={setLightboxIndex}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
