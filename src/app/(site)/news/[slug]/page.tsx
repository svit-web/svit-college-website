import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { DetailPageLayout } from "@/components/site-next/DetailPageLayout";
import { formatDate } from "@/components/site-next/DepartmentSections";
import { getAllPosts, getPostBySlug } from "@/lib/posts.functions";
import { ChevronRight } from "lucide-react";
import { getEntryAlbum } from "@/lib/gallery.functions";
import { metaDescription, newsArticleJsonLd, parseRobots, siteOpenGraph } from "@/lib/seo";
import { JsonLd } from "@/components/site-next/JsonLd";

// ISR: this page reads from Supabase (not Next's fetch()), so without this
// it re-queries the DB on every single request. Caching the render for 5
// minutes removes that from the hot path; admin writes still show up
// immediately via revalidatePublicSite()'s revalidatePath('/', 'layout')
// (src/app/admin/actions.ts), which invalidates this on-demand regardless
// of the window below. See optimization_plan.md A3/A4.
export const revalidate = 300; // seconds

export async function generateStaticParams() {
  const posts = await getAllPosts().catch(() => []);
  return posts.map((p) => ({ slug: p.slug }));
}

// Per-request dedupe between generateMetadata and the page.
const loadPost = cache(async (slug: string) => {
  const post = await getPostBySlug(slug).catch(() => null);
  if (!post) return null;
  const album = await getEntryAlbum(post.album_id).catch(() => null);
  // card_photo_url is a legacy column the admin's Photos editor doesn't
  // write to any more (it manages album_id/gallery_media instead — see
  // AdminCrudManager's ENTRY_PHOTO_FIELDS) — fall back to the album's
  // cover so a photo added via admin actually shows up here.
  const coverPhoto = post.card_photo_url ?? album?.coverUrl ?? null;
  return { post, album, coverPhoto };
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const loaded = await loadPost(slug);
  if (!loaded) return { title: "News not found — SVIT Vasad", robots: { index: false } };
  const { post, coverPhoto } = loaded;
  const seo = post.seo;
  const description = seo?.meta_description || metaDescription(post.summary ?? post.content);
  const image = seo?.og_image_url || coverPhoto;
  const base = await siteOpenGraph();
  return {
    title: seo?.meta_title || `${post.title} — News — SVIT Vasad`,
    description,
    alternates: { canonical: seo?.canonical_url || `/news/${post.slug}` },
    robots: parseRobots(seo?.robots_directives),
    openGraph: {
      ...base,
      type: "article",
      title: seo?.og_title || seo?.meta_title || post.title,
      description: seo?.og_description || description,
      ...(image && { images: [image] }),
      ...(post.published_at && { publishedTime: post.published_at }),
      modifiedTime: post.updated_at,
    },
  };
}

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const loaded = await loadPost(slug);
  if (!loaded) notFound();

  const { post, album, coverPhoto } = loaded;

  return (
    <div className="bg-paper">
      <JsonLd
        data={newsArticleJsonLd({
          title: post.title,
          url: `/news/${post.slug}`,
          description: metaDescription(post.summary ?? post.content),
          image: coverPhoto,
          publishedAt: post.published_at,
          updatedAt: post.updated_at,
        })}
      />
      <nav
        aria-label="Breadcrumb"
        className="container-page flex flex-wrap items-center gap-1.5 pb-6 pt-[clamp(112px,16vh,180px)] text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-ink-mute"
      >
        <Link href="/" className="-my-1.5 inline-block py-1.5 transition-colors hover:text-crimson">
          Home
        </Link>
        <ChevronRight aria-hidden className="h-3 w-3" />
        <Link href="/news" className="-my-1.5 inline-block py-1.5 transition-colors hover:text-crimson">
          News
        </Link>
        <ChevronRight aria-hidden className="h-3 w-3" />
        <span aria-current="page" className="truncate text-ink-soft">{post.title}</span>
      </nav>

      <div className="container-page max-w-4xl pb-16 pt-6">
        <DetailPageLayout
          entry={{
            title: post.title,
            accent: post.category?.name ?? "News",
            subtitle: [
              post.published_at ? formatDate(post.published_at) : null,
              post.department?.name ?? post.college?.name ?? null,
            ]
              .filter(Boolean)
              .join(" · "),
            description: post.content ?? post.summary,
            cardPhotoUrl: post.card_photo_url,
            album,
          }}
        />
      </div>
    </div>
  );
}
