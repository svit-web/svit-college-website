"use client";

import { usePathname } from "next/navigation";
import type { MenuLink } from "@/lib/menus.functions";
import { SectionSideNav } from "@/components/site-next/SectionSideNav";

export function AboutNav({ items }: { items: MenuLink[] }) {
  const pathname = usePathname();

  return (
    <SectionSideNav
      title="About SVIT"
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
