import type { Metadata } from "next";
import { PageHero } from "@/components/site-next/PageHero";
import { StudentLoginForm } from "@/components/site-next/StudentLoginForm";
import { getMiscSettings } from "@/lib/site-settings.functions";

export const metadata: Metadata = {
  title: "Student Login — SVIT Vasad",
  robots: { index: false, follow: true },
  alternates: { canonical: "/student-login" },
};

export default async function StudentLogin() {
  const misc = await getMiscSettings().catch(() => null);
  const itEmail = misc?.it_support_email ?? "itsupport@svitvasad.ac.in";
  return (
    <>
      <PageHero title="Student Login" accent="Portal Access" subtitle="Student portal access — integration in progress." crumbs={[{ label: "Home", to: "/" }, { label: "Student Login" }]} />

      <section className="container-page py-20">
        <StudentLoginForm itEmail={itEmail} />
      </section>
    </>
  );
}
