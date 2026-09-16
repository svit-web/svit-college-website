"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { ChevronDown, Facebook, Instagram, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { FontSizeControl } from "@/components/a11y/FontSizeControl";
import { SmoothScrollToggle } from "../SmoothScrollToggle";
import { LinkedinIcon } from "./DesktopUtilityBar";
import { groupMenuChildren, type MenuTopItem } from "@/lib/menus.functions";
import type { CampusMegaCategory } from "./CampusMegaPanel";
import type { ContactInfo } from "@/lib/site-settings.functions";

type NavCollege = { id: string; shortCode: string; name: string };

function AccordionItem({
  label,
  isOpen,
  onToggle,
  children,
}: {
  label: string;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <div className="border-b border-line">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between py-[0.85rem] text-left text-[1.3rem] font-bold tracking-[-0.02em] text-ink"
      >
        {label}
        <ChevronDown
          className={cn("h-4 w-4 text-crimson transition-transform", isOpen && "rotate-180")}
        />
      </button>
      {isOpen && <div className="pb-3">{children}</div>}
    </div>
  );
}

export function MobileNavPanel({
  open,
  mainNav,
  utilityNav,
  colleges,
  campusCategories,
  contactInfo,
  onNavigate,
}: {
  open: boolean;
  mainNav: MenuTopItem[];
  utilityNav: MenuTopItem[];
  colleges: NavCollege[];
  campusCategories: CampusMegaCategory[];
  contactInfo: ContactInfo | null;
  onNavigate: () => void;
}) {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const toggle = (key: string) => setOpenKey((k) => (k === key ? null : key));

  if (!open) return null;

  const home = mainNav.find((i) => i.title === "Home");
  const about = mainNav.find((i) => i.menu_type === "links_mega" && i.title === "About SVIT");
  const admissions = mainNav.find((i) => i.menu_type === "links_mega" && i.title === "Admissions");
  const collegesItem = mainNav.find((i) => i.menu_type === "colleges_mega");
  const campusItem = mainNav.find((i) => i.menu_type === "campus_mega");
  const placementItem = mainNav.find((i) => i.menu_type === "placement_mega");

  const socials = {
    facebook: contactInfo?.social_links?.Facebook,
    instagram: contactInfo?.social_links?.Instagram,
    linkedin: contactInfo?.social_links?.LinkedIn,
  };

  return (
    <nav
      id="mobile-nav-panel"
      className="fixed inset-x-0 top-16 z-40 max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-line bg-cream text-ink lg:hidden"
      aria-label="Mobile"
    >
      <div className="container-page flex flex-col gap-1 py-4">
        {home && (
          <Link
            href={home.url ?? "/"}
            onClick={onNavigate}
            className="block border-b border-line py-[0.85rem] text-[1.3rem] font-bold tracking-[-0.02em] text-ink"
          >
            {home.title}
          </Link>
        )}

        {about && (
          <AccordionItem
            label={about.title}
            isOpen={openKey === "about"}
            onToggle={() => toggle("about")}
          >
            {groupMenuChildren(about.children).map((g) => (
              <div key={g.group ?? "default"} className="mb-2">
                {g.group && (
                  <div className="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-widest text-crimson">
                    {g.group}
                  </div>
                )}
                {g.items.map((link) => (
                  <Link
                    key={link.id}
                    href={link.url ?? "#"}
                    onClick={onNavigate}
                    className="block px-3 py-2 text-sm text-ink-soft"
                  >
                    {link.title}
                  </Link>
                ))}
              </div>
            ))}
          </AccordionItem>
        )}

        {collegesItem && (
          <AccordionItem
            label={collegesItem.title}
            isOpen={openKey === "colleges"}
            onToggle={() => toggle("colleges")}
          >
            {colleges.map((c) => (
              <Link
                key={c.id}
                href={`/colleges/${c.id}`}
                onClick={onNavigate}
                className="block px-3 py-2 text-sm text-ink-soft"
              >
                {c.name}
              </Link>
            ))}
          </AccordionItem>
        )}

        {admissions && (
          <AccordionItem
            label={admissions.title}
            isOpen={openKey === "admissions"}
            onToggle={() => toggle("admissions")}
          >
            {groupMenuChildren(admissions.children).map((g) => (
              <div key={g.group ?? "default"} className="mb-2">
                {g.group && (
                  <div className="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-widest text-crimson">
                    {g.group}
                  </div>
                )}
                {g.items.map((link) => (
                  <Link
                    key={link.id}
                    href={link.url ?? "#"}
                    onClick={onNavigate}
                    className="block px-3 py-2 text-sm text-ink-soft"
                  >
                    {link.title}
                  </Link>
                ))}
              </div>
            ))}
          </AccordionItem>
        )}

        {campusItem && (
          <AccordionItem
            label={campusItem.title}
            isOpen={openKey === "campus"}
            onToggle={() => toggle("campus")}
          >
            {campusCategories.map((cat) => (
              <div key={cat.key} className="mb-2">
                <Link
                  href={cat.allTo}
                  onClick={onNavigate}
                  className="block px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-widest text-crimson"
                >
                  {cat.title}
                </Link>
                {cat.items.map((it) => (
                  <Link
                    key={it.to}
                    href={it.to}
                    onClick={onNavigate}
                    className="block px-3 py-1.5 text-sm text-ink-soft"
                  >
                    {it.label}
                  </Link>
                ))}
              </div>
            ))}
          </AccordionItem>
        )}

        {placementItem && (
          <Link
            href={placementItem.url ?? "/placement"}
            onClick={onNavigate}
            className="block border-b border-line py-[0.85rem] text-[1.3rem] font-bold tracking-[-0.02em] text-ink"
          >
            {placementItem.title}
          </Link>
        )}

        <div className="my-2 border-t border-line" />
        <div className="flex items-center gap-4 px-3 py-2">
          <FontSizeControl scope="site" className="text-ink-soft" />
          <SmoothScrollToggle className="text-ink-soft" />
          <Link
            href="/admin"
            onClick={onNavigate}
            aria-label="Admin"
            title="Admin"
            className="text-ink-soft hover:text-crimson"
          >
            <LayoutDashboard className="h-4 w-4" />
          </Link>
        </div>

        <div className="my-2 border-t border-line" />
        {utilityNav.map((item) => (
          <Link
            key={item.id}
            href={item.url ?? "#"}
            onClick={onNavigate}
            className="px-3 py-2 text-xs uppercase tracking-wider text-ink-mute"
          >
            {item.title}
          </Link>
        ))}

        <div className="flex items-center gap-4 px-3 py-3">
          {socials.facebook && (
            <a
              href={socials.facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="text-ink-soft hover:text-crimson"
            >
              <Facebook className="h-4 w-4" />
            </a>
          )}
          {socials.instagram && (
            <a
              href={socials.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="text-ink-soft hover:text-crimson"
            >
              <Instagram className="h-4 w-4" />
            </a>
          )}
          {socials.linkedin && (
            <a
              href={socials.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="text-ink-soft hover:text-crimson"
            >
              <LinkedinIcon className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>
    </nav>
  );
}
