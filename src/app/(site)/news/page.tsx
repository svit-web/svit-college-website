import type { Metadata } from "next";
import { PageHero } from "@/components/site-next/PageHero";
import { Reveal } from "@/components/site-next/Reveal";
import { EntryCard } from "@/components/site-next/EntryCard";
import { getAllPosts, type Post } from "@/lib/posts.functions";
import type { EntryCardData } from "@/lib/entry";

export const metadata: Metadata = {
  title: "News — SVIT Vasad",
};

function toNewsCard(post: Post): EntryCardData {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    subtitle: post.category?.name ?? null,
    description: post.summary,
    cardPhotoUrl: post.card_photo_url,
    hasDetailPage: true,
    detailHref: `/news/${post.slug}`,
  };
}

export default async function News() {
  const posts = await getAllPosts().catch(() => []);

  return (
    <>
      <PageHero
        title="News"
        accent="Latest at SVIT"
        subtitle="Announcements and campus stories."
        crumbs={[{ label: "Home", to: "/" }, { label: "News" }]}
      />

      <section className="container-page py-20">
        {posts.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">No news published yet.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, i) => (
              <Reveal key={post.id} delay={(i % 6) * 0.04}>
                <EntryCard entry={toNewsCard(post)} />
              </Reveal>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
