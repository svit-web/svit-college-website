"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function CurtainImage({
  src,
  alt,
  className,
  sizes,
}: {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
}) {
  const figRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const fig = figRef.current;
    const img = imgRef.current;
    if (!fig || !img) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const cover = document.createElement("span");
    cover.className = "absolute inset-0 z-10 bg-background will-change-transform";
    fig.appendChild(cover);
    gsap.set(img, { scale: 1.28, transformOrigin: "50% 50%" });

    const tl = gsap.timeline({
      scrollTrigger: { trigger: fig, start: "top 82%", once: true },
      onComplete() {
        cover.remove();
        gsap.set(img, { clearProps: "transform" });
      },
    });
    tl.to(cover, { yPercent: -101, duration: 0.95, ease: "power4.inOut" }).to(
      img,
      { scale: 1, duration: 1.25, ease: "power3.out" },
      "<",
    );
    // See RecruitersMarquee.tsx: a trigger measured before layout settles
    // can end up stale and never fire. One refresh next frame fixes it.
    const refreshRaf = requestAnimationFrame(() => tl.scrollTrigger?.refresh());

    return () => {
      cancelAnimationFrame(refreshRaf);
      tl.scrollTrigger?.kill();
      tl.kill();
      cover.remove();
    };
  }, [src]);

  return (
    <div ref={figRef} className={cn("relative overflow-hidden", className)}>
      <Image
        ref={imgRef}
        src={src}
        alt={alt}
        fill
        sizes={sizes ?? "(max-width: 768px) 100vw, 480px"}
        className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
      />
    </div>
  );
}
