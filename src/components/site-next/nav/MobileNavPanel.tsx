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
import type { Department } from "@/lib/departments.functions";

type NavCollege = { id: string; shortCode: string; name: string };

// A second-level row inside an expanded top-level item: the label links to its
// own page and, when it has sub-items, a chevron expands them in place (a
// college's departments, a Campus Life category's items, a link group).
function SubAccordionRow({
  label,
  href,
  items,
  isOpen,
  onToggle,
  onNavigate,
  heading = false,
}: {
  label: string;
  href?: string | null;
  items: { key: string; label: string; href: string }[];
  isOpen: boolean;
  onToggle: () => void;
  onNavigate: () => void;
  /** Small crimson uppercase label (Campus Life categories, link groups). */
  heading?: boolean;
}) {
  const hasItems = items.length > 0;
  const labelClass = heading
    ? "block flex-1 px-3 py-2.5 text-[11px] font-bold uppercase tracking-widest text-crimson"
    : "block flex-1 px-3 py-2 text-sm text-ink-soft";

  return (
    <div>
      <div className="flex items-stretch">
        {href ? (
          <Link href={href} onClick={onNavigate} className={labelClass}>
            {label}
          </Link>
        ) : (
          <button type="button" onClick={onToggle} className={cn(labelClass, "text-left")}>
            {label}
          </button>
        )}
        {hasItems && (
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={isOpen}
            aria-label={`${isOpen ? "Collapse" : "Expand"} ${label}`}
            className="px-3 py-2 text-crimson"
          >
            <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
          </button>
        )}
      </div>
      {isOpen && hasItems && (
        <div className="pb-2 pl-6">
          {items.map((it) => (
            <Link
              key={it.key}
              href={it.href}
              onClick={onNavigate}
              className="block px-3 py-1.5 text-[13px] text-ink-mute"
            >
              {it.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

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

// Ungrouped links list directly; each named group is its own expandable row.
function LinksAccordionBody({
  item,
  openSubKey,
  onToggleSub,
  onNavigate,
}: {
  item: MenuTopItem;
  openSubKey: string | null;
  onToggleSub: (key: string) => void;
  onNavigate: () => void;
}) {
  return (
    <>
      {groupMenuChildren(item.children).map((g) => {
        const links = g.items.map((link) => ({
          key: link.id,
          label: link.title,
          href: link.url ?? "#",
        }));
        if (!g.group) {
          return links.map((l) => (
            <Link
              key={l.key}
              href={l.href}
              onClick={onNavigate}
              className="block px-3 py-2 text-sm text-ink-soft"
            >
              {l.label}
            </Link>
          ));
        }
        const key = `${item.id}:${g.group}`;
        return (
          <SubAccordionRow
            key={key}
            heading
            label={g.group}
            items={links}
            isOpen={openSubKey === key}
            onToggle={() => onToggleSub(key)}
            onNavigate={onNavigate}
          />
        );
      })}
    </>
  );
}

export function MobileNavPanel({
  open,
  mainNav,
  utilityNav,
  colleges,
  departmentsByCollege,
  campusCategories,
  contactInfo,
  onNavigate,
}: {
  open: boolean;
  mainNav: MenuTopItem[];
  utilityNav: MenuTopItem[];
  colleges: NavCollege[];
  departmentsByCollege: Record<string, Department[]>;
  campusCategories: CampusMegaCategory[];
  contactInfo: ContactInfo | null;
  onNavigate: () => void;
}) {
  const [openKey, setOpenKey] = useState<string | null>(null);
  // One open second-level row at a time (a college, a Campus Life category, a link group).
  const [openSubKey, setOpenSubKey] = useState<string | null>(null);
  const toggle = (key: string) => setOpenKey((k) => (k === key ? null : key));
  const toggleSub = (key: string) => setOpenSubKey((k) => (k === key ? null : key));

  if (!open) return null;

  const socials = {
    facebook: contactInfo?.social_links?.Facebook,
    instagram: contactInfo?.social_links?.Instagram,
    linkedin: contactInfo?.social_links?.LinkedIn,
  };

  return (
    <nav
      id="mobile-nav-panel"
      className="fixed inset-x-0 top-16 z-40 max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-line bg-paper text-ink lg:hidden"
      aria-label="Mobile"
    >
      <div className="container-page flex flex-col gap-1 py-4">
        {mainNav.map((item) => {
          if (item.menu_type === "links_mega") {
            return (
              <AccordionItem
                key={item.id}
                label={item.title}
                isOpen={openKey === item.id}
                onToggle={() => toggle(item.id)}
              >
                <LinksAccordionBody
                  item={item}
                  openSubKey={openSubKey}
                  onToggleSub={toggleSub}
                  onNavigate={onNavigate}
                />
              </AccordionItem>
            );
          }

          if (item.menu_type === "colleges_mega") {
            return (
              <AccordionItem
                key={item.id}
                label={item.title}
                isOpen={openKey === item.id}
                onToggle={() => toggle(item.id)}
              >
                {colleges.map((c) => (
                  <SubAccordionRow
                    key={c.id}
                    label={c.name}
                    href={`/colleges/${c.id}`}
                    items={(departmentsByCollege[c.id] ?? []).map((d) => ({
                      key: d.id,
                      label: d.name,
                      href: `/departments/${d.code}`,
                    }))}
                    isOpen={openSubKey === `college:${c.id}`}
                    onToggle={() => toggleSub(`college:${c.id}`)}
                    onNavigate={onNavigate}
                  />
                ))}
              </AccordionItem>
            );
          }

          if (item.menu_type === "campus_mega") {
            return (
              <AccordionItem
                key={item.id}
                label={item.title}
                isOpen={openKey === item.id}
                onToggle={() => toggle(item.id)}
              >
                {campusCategories.map((cat) => (
                  <SubAccordionRow
                    key={cat.key}
                    heading
                    label={cat.title}
                    href={cat.allTo}
                    items={[
                      ...cat.items.map((it) => ({ key: it.to, label: it.label, href: it.to })),
                      // The category shows only its newest items; keep a way to the rest.
                      ...(cat.items.length > 0
                        ? [{ key: `${cat.key}:all`, label: `${cat.allLabel} →`, href: cat.allTo }]
                        : []),
                    ]}
                    isOpen={openSubKey === `campus:${cat.key}`}
                    onToggle={() => toggleSub(`campus:${cat.key}`)}
                    onNavigate={onNavigate}
                  />
                ))}
              </AccordionItem>
            );
          }

          // A plain item that has sub-items in Menus / Nav expands like the
          // mega items instead of hiding them.
          if (item.children.length > 0) {
            return (
              <AccordionItem
                key={item.id}
                label={item.title}
                isOpen={openKey === item.id}
                onToggle={() => toggle(item.id)}
              >
                {item.url && (
                  <Link
                    href={item.url}
                    onClick={onNavigate}
                    className="block px-3 py-2 text-sm font-semibold text-navy"
                  >
                    {item.title} overview
                  </Link>
                )}
                <LinksAccordionBody
                  item={item}
                  openSubKey={openSubKey}
                  onToggleSub={toggleSub}
                  onNavigate={onNavigate}
                />
              </AccordionItem>
            );
          }

          return (
            <Link
              key={item.id}
              href={item.url ?? "#"}
              onClick={onNavigate}
              className="block border-b border-line py-[0.85rem] text-[1.3rem] font-bold tracking-[-0.02em] text-ink"
            >
              {item.title}
            </Link>
          );
        })}

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
