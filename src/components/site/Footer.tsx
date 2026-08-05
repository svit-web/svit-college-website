import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Twitter, Youtube, ChevronDown } from "lucide-react";
import { Logo } from "./Logo";
import { useQuery } from "@tanstack/react-query";
import { programmesQuery, contactInfoQuery, miscSettingsQuery } from "@/lib/homepage";

const fallbackSite = {
  fullName: "Sardar Vallabhbhai Institute of Technology",
  email: "info@svitvasad.ac.in",
  phone: "+91 2692 274766",
  address: "Beside GIDC Vasad, Vasad — 388306, Anand, Gujarat, India",
};

const socialIconMap: Record<string, typeof Facebook> = {
  Facebook,
  Instagram,
  LinkedIn: Linkedin,
  Twitter,
  Youtube,
};

export function Footer() {
  const { data: programmes } = useQuery(programmesQuery);
  const { data: contactInfo } = useQuery(contactInfoQuery);
  const { data: misc } = useQuery(miscSettingsQuery);

  const site = {
    fullName: contactInfo?.full_name ?? fallbackSite.fullName,
    email: contactInfo?.email ?? fallbackSite.email,
    phone: contactInfo?.phone ?? fallbackSite.phone,
    address: contactInfo?.address ?? fallbackSite.address,
  };

  const socialLinks = contactInfo?.social_links ?? {};

  const quick = [
    { label: "About Us", to: "/about" },
    { label: "Admissions", to: "/admissions" },
    { label: "Campus Life", to: "/campus-life" },
    { label: "Placement", to: "/placement/overview" },
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
            <Logo light />
            <p className="mt-4 text-sm text-white/70 max-w-sm">
              {site.fullName} — a premier institute committed to excellence in education, research and community impact since {misc?.year_established ?? 1997}.
            </p>
            <div className="mt-5 space-y-2 text-sm">
              <div className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 text-gold shrink-0" /><span>{site.address}</span></div>
              <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="flex items-center gap-2 hover:text-gold"><Phone className="h-4 w-4 text-gold" /> {site.phone}</a>
              <a href={`mailto:${site.email}`} className="flex items-center gap-2 hover:text-gold"><Mail className="h-4 w-4 text-gold" /> {site.email}</a>
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
          <div>&copy; {new Date().getFullYear()} {site.fullName}. All rights reserved.</div>
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
        <ChevronDown className={`h-4 w-4 text-white/50 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {/* Desktop: always visible heading */}
      <h4 className="hidden md:block font-display text-sm font-bold uppercase tracking-widest text-white">{title}</h4>

      {/* Links: hidden on mobile until open, always visible on desktop */}
      <ul className={`space-y-2 text-sm pb-3 md:pb-0 md:mt-4 md:block ${open ? "block mt-1" : "hidden"}`}>
        {links.map((l) => (
          <li key={l.to}>
            <Link to={l.to} className="hover:text-gold transition-colors">{l.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
