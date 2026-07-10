import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import { SectionHeading } from "@/components/site/SectionHeading";
import { CTABanner } from "@/components/site/CTABanner";
import { FacultyGrid } from "@/components/site/FacultyGrid";
import { courses } from "@/data/site";
import type { CourseSlug } from "@/data/site";
import { getFaculty } from "@/lib/faculty";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/courses/$course/faculty")({
  loader: ({ params }) => {
    const course = courses.find((c) => c.slug === (params.course as CourseSlug));
    if (!course) throw notFound();
    return { course };
  },
  head: ({ loaderData }) => ({ meta: [{ title: loaderData ? `${loaderData.course.name} Faculty — SVIT Vasad` : "Faculty" }] }),
  notFoundComponent: () => <div className="container-page py-32 text-center"><h1>Not found</h1></div>,
  component: CourseFacultyPage,
});

function CourseFacultyPage() {
  const { course } = Route.useLoaderData();
  const faculty = getFaculty(course.slug, course.highlights, 9);
  return (
    <>
      <PageHero title={`${course.name} Faculty`} accent="Meet the mentors" crumbs={[{ label: "Home", to: "/" }, { label: "Courses", to: "/courses" }, { label: course.name, to: "/courses/$course" }, { label: "Faculty" }]} />
      <section className="container-page py-20">
        <SectionHeading center eyebrow="Our Team" title="Experienced Faculty" subtitle="Senior mentors combining research depth with industry experience." />
        <div className="mt-12"><FacultyGrid members={faculty} /></div>
        <div className="mt-10 text-center">
          <Link to="/courses/$course" params={{ course: course.slug }} className="inline-flex items-center gap-1 text-sm text-navy hover:text-gold link-underline">
            <ArrowLeft className="h-4 w-4" /> Back to {course.name}
          </Link>
        </div>
      </section>
      <CTABanner />
    </>
  );
}
