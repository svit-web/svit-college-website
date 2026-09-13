import Link from "next/link";
import { Facebook, Instagram, Mail, Phone } from "lucide-react";
import { FontSizeControl } from "@/components/a11y/FontSizeControl";
import { SmoothScrollToggle } from "../SmoothScrollToggle";
import { SiteSearch } from "../SiteSearch";
import type { MenuTopItem } from "@/lib/menus.functions";
import type { ContactInfo } from "@/lib/site-settings.functions";

export function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

export function DesktopUtilityBar({
  utilityNav,
  contactInfo,
}: {
  utilityNav: MenuTopItem[];
  contactInfo: ContactInfo | null;
}) {
  const socials = {
    facebook: contactInfo?.social_links?.Facebook,
    instagram: contactInfo?.social_links?.Instagram,
    linkedin: contactInfo?.social_links?.LinkedIn,
  };

  return (
    <div className="hidden bg-navy-deep text-xs text-white/85 lg:block">
      <div className="container-page flex h-9 items-center justify-between">
        <div className="flex items-center gap-4">
          {contactInfo?.email && (
            <a
              href={`mailto:${contactInfo.email}`}
              className="inline-flex items-center gap-1.5 hover:text-gold"
            >
              <Mail className="h-3 w-3" /> {contactInfo.email}
            </a>
          )}
          {contactInfo?.phone && (
            <a
              href={`tel:${contactInfo.phone.replace(/\s/g, "")}`}
              className="inline-flex items-center gap-1.5 hover:text-gold"
            >
              <Phone className="h-3 w-3" /> {contactInfo.phone}
            </a>
          )}
        </div>
        <div className="flex items-center gap-4">
          {utilityNav.map((item) => (
            <Link
              key={item.id}
              href={item.url ?? "#"}
              className="transition-colors hover:text-gold"
            >
              {item.title}
            </Link>
          ))}
          <div className="flex items-center gap-3 border-l border-white/20 pl-4">
            {socials.facebook && (
              <a
                href={socials.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="hover:text-gold"
              >
                <Facebook className="h-3.5 w-3.5" />
              </a>
            )}
            {socials.instagram && (
              <a
                href={socials.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="hover:text-gold"
              >
                <Instagram className="h-3.5 w-3.5" />
              </a>
            )}
            {socials.linkedin && (
              <a
                href={socials.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="hover:text-gold"
              >
                <LinkedinIcon className="h-3.5 w-3.5" />
              </a>
            )}
            <span className="h-3.5 w-px bg-white/20" aria-hidden="true" />
            <FontSizeControl scope="site" className="text-white/85" />
            <SmoothScrollToggle className="text-white/85" />
            <SiteSearch className="text-white/85 hover:text-gold" />
          </div>
        </div>
      </div>
    </div>
  );
}
