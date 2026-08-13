import { notFound } from "next/navigation";
import { PillTabs } from "@/components/site-next/PillTabs";
import { getAllStudentClubs, getStudentClubBySlug } from "@/lib/clubs.functions";

export default async function ClubLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [item, allClubs] = await Promise.all([
    getStudentClubBySlug(slug).catch(() => null),
    getAllStudentClubs().catch(() => []),
  ]);

  if (!item) notFound();

  return (
    <div>
      <PillTabs
        ariaLabel="Clubs"
        items={allClubs.map((c) => ({ label: c.name, to: `/campus-life/clubs/${c.slug}` }))}
      />
      {children}
    </div>
  );
}
