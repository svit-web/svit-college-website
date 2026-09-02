import { Header } from "@/components/site-next/Header";
import { Footer } from "@/components/site-next/Footer";
import { FontSizeControl } from "@/components/a11y/FontSizeControl";
import { getCollegesGrid } from "@/lib/homepage.functions";
import { getContactInfo, getMiscSettings } from "@/lib/site-settings.functions";
import { getAllDepartments } from "@/lib/departments.functions";
import { getAllFacilities } from "@/lib/facilities.functions";
import { getFeaturedStudentClubs } from "@/lib/clubs.functions";
import { getAllEvents } from "@/lib/events.functions";
import { getSports } from "@/lib/sports.functions";
import { getAllCenters } from "@/lib/centers.functions";
import { getAllProgrammes } from "@/lib/programmes.functions";

export default async function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [colleges, contactInfo, misc, departments, facilities, featuredClubs, events, sports, centers, programmes] =
    await Promise.all([
      getCollegesGrid().catch(() => []),
      getContactInfo().catch(() => null),
      getMiscSettings().catch(() => null),
      getAllDepartments().catch(() => []),
      getAllFacilities().catch(() => []),
      getFeaturedStudentClubs().catch(() => []),
      getAllEvents().catch(() => []),
      getSports().catch(() => []),
      getAllCenters().catch(() => []),
      getAllProgrammes().catch(() => []),
    ]);

  const logoUrl = colleges.find((c) => c.slug === "svit-degree")?.logo_url ?? null;

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        colleges={colleges}
        contactInfo={contactInfo}
        misc={misc}
        departments={departments}
        facilities={facilities}
        featuredClubs={featuredClubs}
        events={events}
        sports={sports}
        centers={centers}
        logoUrl={logoUrl}
      />
      <main className="flex-1">{children}</main>
      <Footer
        programmes={programmes}
        contactInfo={contactInfo}
        misc={misc}
        logoUrl={logoUrl}
      />
      <FontSizeControl scope="site" variant="floating" />
    </div>
  );
}
