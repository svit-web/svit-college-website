"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getScrollVelocity } from "@/lib/scroll-engine";
import type { RecruiterRow } from "@/lib/homepage";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

function RecruiterItem({ recruiter }: { recruiter: RecruiterRow }) {
  return (
    <span className="inline-flex items-center whitespace-nowrap text-[1.05rem] font-semibold text-navy opacity-[0.42] transition-opacity hover:opacity-100 after:mx-[1.9rem] after:inline-block after:h-[5px] after:w-[5px] after:shrink-0 after:rounded-full after:bg-border after:align-middle">
      {recruiter.logo_url ? (
        // eslint-disable-next-line @next/next/no-img-element -- decorative marquee logo, arbitrary aspect ratio
        <img
          src={recruiter.logo_url}
          alt={recruiter.company_name}
          className="h-8 w-auto object-contain grayscale"
        />
      ) : (
        recruiter.company_name
      )}
    </span>
  );
}

export function RecruitersMarquee({ recruiters }: { recruiters: RecruiterRow[] }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const track = trackRef.current;
    const group = track?.firstElementChild as HTMLElement | null | undefined;
    if (!wrap || !track || !group) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const clone = group.cloneNode(true) as HTMLElement;
    clone.setAttribute("aria-hidden", "true");
    track.appendChild(clone);

    const tween = gsap.fromTo(
      track,
      { xPercent: 0 },
      { xPercent: -50, duration: 60, ease: "none", repeat: -1 },
    );

    let hover = 1;
    let skew = 0;
    const onEnter = () => {
      hover = 0.3;
    };
    const onLeave = () => {
      hover = 1;
    };
    wrap.addEventListener("mouseenter", onEnter);
    wrap.addEventListener("mouseleave", onLeave);

    const trigger = ScrollTrigger.create({
      trigger: wrap,
      start: "top bottom",
      end: "bottom top",
      onToggle: (self) => (self.isActive ? tween.resume() : tween.pause()),
    });
    // A trigger created before layout has fully settled (e.g. during React
    // Strict Mode's mount->cleanup->mount cycle) can end up measured against
    // stale positions and never toggle active. One refresh next frame fixes it.
    const refreshRaf = requestAnimationFrame(() => trigger.refresh());

    const tick = () => {
      const v = getScrollVelocity();
      const dir = v < -0.2 ? -1 : 1;
      const speed = (1 + Math.min(Math.abs(v) * 0.045, 2.2)) * hover;
      tween.timeScale(gsap.utils.interpolate(tween.timeScale(), dir * speed, 0.075));
      skew = gsap.utils.interpolate(skew, gsap.utils.clamp(-9, 9, v * 0.55), 0.09);
      gsap.set(track, { skewX: skew });
    };
    gsap.ticker.add(tick);

    return () => {
      cancelAnimationFrame(refreshRaf);
      gsap.ticker.remove(tick);
      trigger.kill();
      tween.kill();
      wrap.removeEventListener("mouseenter", onEnter);
      wrap.removeEventListener("mouseleave", onLeave);
      clone.remove();
      gsap.set(track, { clearProps: "transform" });
    };
  }, [recruiters]);

  if (!recruiters || recruiters.length === 0) return null;

  return (
    <div
      ref={wrapRef}
      className="mt-6 overflow-hidden [-webkit-mask-image:linear-gradient(90deg,transparent,#000_7%,#000_93%,transparent)] [mask-image:linear-gradient(90deg,transparent,#000_7%,#000_93%,transparent)]"
    >
      <div
        ref={trackRef}
        className="flex w-max items-center will-change-transform motion-reduce:w-auto motion-reduce:flex-wrap"
      >
        <div className="flex flex-shrink-0 items-center motion-reduce:flex-wrap">
          {recruiters.map((r) => (
            <RecruiterItem key={r.company_name} recruiter={r} />
          ))}
        </div>
      </div>
    </div>
  );
}
