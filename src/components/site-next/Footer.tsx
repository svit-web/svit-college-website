'use client';

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Twitter, Youtube, ChevronDown } from "lucide-react";
import { Logo } from "./Logo";
import type { MiscSettings } from "@/lib/site-settings.functions";
import type { ContactInfo } from "@/lib/pages.functions";
import type { Programme } from "@/lib/programmes.functions";

const socialIconMap: Record<string, typeof Facebook> = {
  Facebook,
  Instagram,
  LinkedIn: Linkedin,
  Twitter,
  Youtube,
};

export interface FooterProps {
  programmes: Programme[];
  contactInfo: ContactInfo | null;
  misc: MiscSettings | null;
  logoUrl: string | null;
}

export function Footer({ programmes, contactInfo, misc, logoUrl }: FooterProps) {
  const site = {
    fullName: contactInfo?.full_name,
    email: contactInfo?.email,
    phone: contactInfo?.phone,
    address: contactInfo?.address,
  };

  const socialLinks = contactInfo?.social_links ?? {};

  const quick = [
    { label: "About Us", to: "/about" },
    { label: "Admissions", to: "/admissions" },
    { label: "Campus Life", to: "/campus-life" },
    { label: "Placement", to: "/placement" },
    { label: "News & Events", to: "/news" },
  ];
  const important = [
    { label: "Anti-Ragging", to: "/anti-ragging" },
    { label: "Grievance Redressal", to: "/grievance" },
    { label: "Downloads", to: "/downloads" },
    { label: "Careers", to: "/careers" },
    { label: "Alumni", to: "/alumni" },
  ];

  return (
    <footer className="bg-navy-deep text-white/80">
      <div className="container-page py-8 md:py-14">
        <div className="grid gap-0 md:gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2 mb-2 md:mb-0">
            <Logo light logoUrl={logoUrl} />
            <p className="mt-4 text-sm text-white/70 max-w-sm">
              {site.fullName} — a premier institute committed to excellence in education, research and community impact{misc?.year_established ? ` since ${misc.year_established}` : ""}.
            </p>
            <div className="mt-5 space-y-2 text-sm">
              {site.address && <div className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 text-gold shrink-0" /><span>{site.address}</span></div>}
              {site.phone && <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="flex items-center gap-2 hover:text-gold"><Phone className="h-4 w-4 text-gold" /> {site.phone}</a>}
              {site.email && <a href={`mailto:${site.email}`} className="flex items-center gap-2 hover:text-gold"><Mail className="h-4 w-4 text-gold" /> {site.email}</a>}
            </div>
            <div className="mt-5 flex gap-3">
              {Object.entries(socialLinks).map(([platform, url]) => {
                const Icon = socialIconMap[platform];
                if (!Icon || !url) return null;
                return (
                  <a key={platform} href={url} target="_blank" rel="noopener noreferrer" className="rounded-md border border-white/15 p-2 hover:bg-white/10 hover:text-gold transition-colors" aria-label={platform}>
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>

          <FooterCol title="Quick Links" links={quick} />
          <FooterCol title="Courses" links={(programmes ?? []).map((c) => ({ label: c.name, to: `/courses/${c.code}` }))} />
          <FooterCol title="Important" links={important} />
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-5 text-xs text-white/60 md:flex-row">
          <div>&copy; {new Date().getFullYear()}{site.fullName ? ` ${site.fullName}` : ""}. All rights reserved.</div>
          <div>Vasad, Gujarat &bull; India</div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { label: string; to: string }[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-white/10 md:border-none">
      {/* Mobile: tappable header */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between py-3 md:hidden"
      >
        <h4 className="font-display text-sm font-bold uppercase tracking-widest text-white">{title}</h4>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ type: "spring", bounce: 0, duration: 0.25 }}>
        <ChevronDown className="h-4 w-4 text-white/50" />
      </motion.div>
      </button>

      {/* Desktop: always visible heading */}
      <h4 className="hidden md:block font-display text-sm font-bold uppercase tracking-widest text-white">{title}</h4>

      {/* Mobile: animated accordion */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.ul
            key="mobile-links"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", bounce: 0, duration: 0.3 }}
            className="overflow-hidden space-y-2 text-sm pb-3 md:hidden"
          >
            {links.map((l) => (
              <li key={l.to} className="pt-1 first:pt-0">
                <Link href={l.to} className="hover:text-gold transition-colors">{l.label}</Link>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>

      {/* Desktop: always visible */}
      <ul className="hidden md:block space-y-2 text-sm mt-4">
        {links.map((l) => (
          <li key={l.to}>
            <Link href={l.to} className="hover:text-gold transition-colors">{l.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
