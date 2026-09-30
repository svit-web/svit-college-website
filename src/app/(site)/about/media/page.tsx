import type { Metadata } from "next";
import Link from "next/link";
import { SectionHeading } from "@/components/site-next/SectionHeading";
import { Facebook, Instagram, Linkedin, Twitter, ExternalLink } from "lucide-react";
import type { ComponentType } from "react";
import { pillOutline } from "@/components/site-next/site-styles";
import { getAboutPage } from "@/lib/pages.functions";

const socialIcons: Record<string, ComponentType<{ className?: string }>> = {
  Facebook,
  Instagram,
  LinkedIn: Linkedin,
  Linkedin,
  Twitter,
  X: Twitter,
};

export const metadata: Metadata = {
  title: "SVIT Media — SVIT Vasad",
  description:
    "SVIT Vasad in the news, our publications, campus gallery and social media channels.",
};

export default async function MediaPage() {
  const c = await getAboutPage().catch(() => null);

  return (
    <section className="container-page py-16 md:py-20">
      <SectionHeading eyebrow="Stay connected" title="SVIT Media" variant="eyebrow" />
      <p className="mt-4 max-w-3xl text-ink-soft">{c?.media?.intro}</p>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {(c?.media?.publications ?? []).map((p) => (
          <div key={p.name} className="border border-line bg-surface p-6">
            <h3 className="font-display text-lg font-medium text-navy">{p.name}</h3>
            <p className="mt-2 text-sm text-ink-soft leading-relaxed">{p.description}</p>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <div className="text-xs font-semibold uppercase tracking-wider text-crimson mb-3">
          Photo Gallery
        </div>
        <Link href="/gallery" className={pillOutline}>
          Browse Campus Gallery →
        </Link>
      </div>

      <div className="mt-8">
        <div className="text-xs font-semibold uppercase tracking-wider text-crimson">Follow us</div>
        <div className="mt-4 flex flex-wrap gap-3">
          {(c?.media?.socialMedia ?? []).map((s) => {
            const Icon = socialIcons[s.platform] ?? ExternalLink;
            return (
              <a
                key={s.platform}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className={pillOutline}
              >
                <Icon className="h-4 w-4" /> {s.platform}
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
