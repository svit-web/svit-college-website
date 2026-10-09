"use client";

import { usePathname } from "next/navigation";
import type { MenuLink } from "@/lib/menus.functions";
import { SectionTabs } from "@/components/site-next/SectionTabs";

export function AboutNav({ items }: { items: MenuLink[] }) {
  const pathname = usePathname();

  return (
    <SectionTabs
      ariaLabel="About sections"
      items={items.map((s) => {
        const href = s.url ?? "#";
        return {
          href,
          label: s.title,
          active: pathname === href || !!pathname?.startsWith(href + "/"),
        };
      })}
    />
  );
}
