"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Printer,
  Smartphone,
  Twitter,
  Youtube,
  ChevronDown,
} from "lucide-react";
import { Logo } from "./Logo";
import type {
  MiscSettings,
  ContactInfo,
  ContactNumber,
  ContactNumberGroup,
} from "@/lib/site-settings.functions";
import type { MenuTopItem } from "@/lib/menus.functions";

// Keep this in sync with the platform list in AdminSettingsPage's social
// links form (Facebook, Instagram, LinkedIn, Twitter, Youtube) — a platform
// missing here silently drops the admin's saved link instead of rendering it.
const socialIconMap: Record<string, typeof Facebook> = {
  Facebook,
  Instagram,
  LinkedIn: Linkedin,
  Twitter,
  Youtube,
};

export interface FooterProps {
  contactInfo: ContactInfo | null;
  /** contact_numbers, grouped by college; empty → falls back to contactInfo.phone. */
  contactNumbers: ContactNumberGroup[];
  /** 'footer_navigation' menu; empty → falls back to the default columns below. */
  footerNav: MenuTopItem[];
  misc: MiscSettings | null;
  logoUrl: string | null;
}

type FooterColumn = {
  title: string;
  links: { label: string; to: string }[];
  externalLinks: { label: string; href: string }[];
};

// Fallback columns while the 'footer_navigation' menu is missing or empty
// (seeded with these same links by 20261029160000_footer_navigation_menu.sql).
const DEFAULT_COLUMNS: FooterColumn[] = [
  {
    title: "Quick Links",
    links: [
      { label: "About Us", to: "/about" },
      { label: "Admissions", to: "/admissions" },
      { label: "Campus Life", to: "/campus-life" },
      { label: "Placement", to: "/placement" },
      { label: "News & Events", to: "/news" },
    ],
    externalLinks: [],
  },
  {
    title: "Important",
    links: [
      { label: "Anti-Ragging", to: "/anti-ragging" },
      { label: "Grievance Redressal", to: "/grievance" },
      { label: "Downloads", to: "/downloads" },
      { label: "Careers", to: "/careers" },
    ],
    externalLinks: [{ label: "Alumni", href: "https://alumni.svitvasad.ac.in" }],
  },
];

// Brand block spans 2 tracks; one track per link column. Literal strings so
// Tailwind sees every variant.
const LG_GRID_COLS: Record<number, string> = {
  1: "lg:grid-cols-3",
  2: "lg:grid-cols-4",
  3: "lg:grid-cols-5",
  4: "lg:grid-cols-6",
};

function columnsFromMenu(menu: MenuTopItem[]): FooterColumn[] {
  return menu
    .map((col) => {
      const children = col.children.filter((c) => c.url);
      return {
        title: col.title,
        links: children
          .filter((c) => !/^https?:\/\//i.test(c.url!))
          .map((c) => ({ label: c.title, to: c.url! })),
        externalLinks: children
          .filter((c) => /^https?:\/\//i.test(c.url!))
          .map((c) => ({ label: c.title, href: c.url! })),
      };
    })
    .filter((c) => c.links.length + c.externalLinks.length > 0);
}

export function Footer({ contactInfo, contactNumbers, footerNav, misc, logoUrl }: FooterProps) {
  const site = {
    fullName: contactInfo?.full_name,
    email: contactInfo?.email,
    phone: contactInfo?.phone,
    address: contactInfo?.address,
  };

  const socialLinks = contactInfo?.social_links ?? {};

  const menuColumns = columnsFromMenu(footerNav ?? []);
  const columns = (menuColumns.length > 0 ? menuColumns : DEFAULT_COLUMNS).slice(0, 4);

  return (
    <footer className="border-t border-line bg-paper-deep text-ink-soft">
      <div className="container-page py-8 md:py-14">
        <div
          className={`grid gap-0 md:gap-10 md:grid-cols-2 ${LG_GRID_COLS[columns.length] ?? "lg:grid-cols-4"}`}
        >
          <div className="lg:col-span-2 mb-2 md:mb-0">
            <Logo logoUrl={logoUrl} instituteName={site.fullName} />
            <p className="mt-4 text-sm text-ink-soft max-w-sm">
              {site.fullName} — a premier institute committed to excellence in education, research
              and community impact{misc?.year_established ? ` since ${misc.year_established}` : ""}.
            </p>
            <div className="mt-5 space-y-2 text-sm">
              {site.address && (
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 text-navy shrink-0" />
                  <span>{site.address}</span>
                </div>
              )}
              {contactNumbers?.length > 0
                ? // One flat list (institute-wide first, then college order); no college headings.
                  contactNumbers
                    .flatMap((g) => g.numbers)
                    .map((n) => <ContactNumberLine key={n.id} number={n} />)
                : site.phone && (
                    <a
                      href={`tel:${site.phone.replace(/\s/g, "")}`}
                      className="flex items-center gap-2 py-1 hover:text-crimson"
                    >
                      <Phone className="h-4 w-4 text-navy" /> {site.phone}
                    </a>
                  )}
              {site.email && (
                <a
                  href={`mailto:${site.email}`}
                  className="flex items-center gap-2 py-1 hover:text-crimson"
                >
                  <Mail className="h-4 w-4 text-navy" /> {site.email}
                </a>
              )}
            </div>
            <div className="mt-5 flex gap-3">
              {Object.entries(socialLinks).map(([platform, url]) => {
                const Icon = socialIconMap[platform];
                if (!Icon || !url) return null;
                return (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-line-strong text-navy transition-colors hover:border-ink hover:bg-ink hover:text-paper"
                    aria-label={platform}
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {columns.map((c) => (
            <FooterCol
              key={c.title}
              title={c.title}
              links={c.links}
              externalLinks={c.externalLinks}
            />
          ))}
        </div>
      </div>
      <div className="border-t border-line">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-5 text-xs text-ink-mute md:flex-row">
          <div>
            &copy; {new Date().getFullYear()}
            {site.fullName ? ` ${site.fullName}` : ""}. All rights reserved.
          </div>
          <div>Vasad, Gujarat &bull; India</div>
        </div>
      </div>
    </footer>
  );
}

const CONTACT_ICONS: Record<ContactNumber["kind"], typeof Phone> = {
  phone: Phone,
  mobile: Smartphone,
  whatsapp: MessageCircle,
  fax: Printer,
};

function ContactNumberLine({ number: n }: { number: ContactNumber }) {
  const Icon = CONTACT_ICONS[n.kind] ?? Phone;
  const digits = n.phone.replace(/[^\d+]/g, "");
  const content = (
    <>
      <Icon className="h-4 w-4 shrink-0 text-navy" />
      <span>
        {n.phone}
        {n.label && <span className="text-ink-mute"> ({n.label})</span>}
      </span>
    </>
  );
  // Fax numbers aren't dialable from a browser — plain text.
  if (n.kind === "fax") return <div className="flex items-center gap-2 py-1">{content}</div>;
  const href =
    n.kind === "whatsapp" ? `https://wa.me/${digits.replace(/^\+/, "")}` : `tel:${digits}`;
  return (
    <a
      href={href}
      {...(n.kind === "whatsapp" ? { target: "_blank", rel: "noreferrer" } : {})}
      className="flex items-center gap-2 py-1 hover:text-crimson"
    >
      {content}
    </a>
  );
}

function FooterCol({
  title,
  links,
  externalLinks = [],
}: {
  title: string;
  links: { label: string; to: string }[];
  externalLinks?: { label: string; href: string }[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-line md:border-none">
      {/* Mobile: tappable header */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between py-3 md:hidden"
      >
        <h4 className="font-display text-sm font-bold uppercase tracking-widest text-navy">
          {title}
        </h4>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ type: "spring", bounce: 0, duration: 0.25 }}
        >
          <ChevronDown className="h-4 w-4 text-ink-mute" />
        </motion.div>
      </button>

      {/* Desktop: always visible heading */}
      <h4 className="hidden md:block font-display text-sm font-bold uppercase tracking-widest text-navy">
        {title}
      </h4>

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
                <Link href={l.to} className="hover:text-crimson transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
            {externalLinks.map((l) => (
              <li key={l.href} className="pt-1 first:pt-0">
                <a
                  href={l.href}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-crimson transition-colors"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>

      {/* Desktop: always visible */}
      <ul className="hidden md:block space-y-2 text-sm mt-4">
        {links.map((l) => (
          <li key={l.to}>
            <Link href={l.to} className="hover:text-crimson transition-colors">
              {l.label}
            </Link>
          </li>
        ))}
        {externalLinks.map((l) => (
          <li key={l.href}>
            <a
              href={l.href}
              target="_blank"
              rel="noreferrer"
              className="hover:text-crimson transition-colors"
            >
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
