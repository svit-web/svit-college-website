import { Header } from "@/components/site-next/Header";
import { Footer } from "@/components/site-next/Footer";
import { PageTransition } from "@/components/site-next/PageTransition";
import { getCollegesGrid } from "@/lib/homepage.functions";
import { DEFAULT_CONTACT, getContactInfo, getMiscSettings } from "@/lib/site-settings.functions";
import { getAllDepartments } from "@/lib/departments.functions";
import { getAllFacilities } from "@/lib/facilities.functions";
import { getFeaturedStudentClubs } from "@/lib/clubs.functions";
import { getAllEvents } from "@/lib/events.functions";
import { getSports } from "@/lib/sports.functions";
import { getVisibleCenters } from "@/lib/centers.functions";
import { getMainNavigation, getTopUtilityNavigation } from "@/lib/menus.functions";
import { getHeroAppearance } from "@/lib/theme.functions";
import { DEFAULT_HERO_APPEARANCE, heroTextVars } from "@/lib/theme";
import { organizationJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/site-next/JsonLd";

// ISR: this layout alone runs ~12 parallel Supabase queries (nav, footer,
// hero chrome) and previously did so on every single page, every navigation,
// since none of them use Next's fetch() (supabase-js isn't cacheable by
// Next's Data Cache). This is identical data on every page, so it's the
// single highest-value caching target on the site. revalidate here sets a
// floor for every page under (site) — admin writes still invalidate
// immediately via revalidatePublicSite()'s revalidatePath('/', 'layout')
// (src/app/admin/actions.ts); this window is only the periodic fallback.
// See optimization_plan.md A2.
export const revalidate = 300; // seconds

export default async function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [
    colleges,
    contactInfo,
    misc,
    departments,
    facilities,
    featuredClubs,
    events,
    sports,
    centers,
    mainNav,
    utilityNav,
    heroAppearance,
  ] = await Promise.all([
    getCollegesGrid().catch(() => []),
    getContactInfo().catch(() => null),
    getMiscSettings().catch(() => null),
    getAllDepartments().catch(() => []),
    getAllFacilities().catch(() => []),
    getFeaturedStudentClubs().catch(() => []),
    getAllEvents().catch(() => []),
    getSports().catch(() => []),
    getVisibleCenters().catch(() => []),
    getMainNavigation().catch(() => []),
    getTopUtilityNavigation().catch(() => []),
    getHeroAppearance().catch(() => DEFAULT_HERO_APPEARANCE),
  ]);

  const logoUrl = colleges.find((c) => c.slug === "svit-degree")?.logo_url ?? null;

  return (
    // --hero-text (admin "Text Color") is set here once so every hero — including
    // PageHero rendered inside client components — follows the setting.
    <div className="flex min-h-screen flex-col" style={heroTextVars(heroAppearance)}>
      <Header
        mainNav={mainNav}
        utilityNav={utilityNav}
        colleges={colleges}
        contactInfo={contactInfo}
        departments={departments}
        facilities={facilities}
        featuredClubs={featuredClubs}
        events={events}
        sports={sports}
        centers={centers}
        logoUrl={logoUrl}
      />
      <main className="flex-1">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer contactInfo={contactInfo} misc={misc} logoUrl={logoUrl} />
      <JsonLd
        data={organizationJsonLd({
          phone: contactInfo?.phone ?? null,
          email: contactInfo?.email ?? null,
          address: contactInfo?.address ?? null,
          socialLinks: contactInfo?.social_links ?? {},
          logoUrl,
          fullName: contactInfo?.full_name ?? DEFAULT_CONTACT.full_name,
        })}
      />
    </div>
  );
}
