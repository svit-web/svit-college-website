import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { DetailPageLayout } from "@/components/site-next/DetailPageLayout";
import { formatDate } from "@/components/site-next/DepartmentSections";
import { getPostBySlug } from "@/lib/posts.functions";
import { ChevronRight } from "lucide-react";
import { getEntryAlbum } from "@/lib/gallery.functions";

// Per-request dedupe between generateMetadata and the page.
const loadPost = cache(async (slug: string) => {
  const post = await getPostBySlug(slug).catch(() => null);
  if (!post) return null;
  const album = await getEntryAlbum(post.album_id).catch(() => null);
  return { post, album };
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const loaded = await loadPost(slug);
  if (!loaded) return { title: "News not found — SVIT Vasad", robots: { index: false } };
  return {
    title: `${loaded.post.title} — News — SVIT Vasad`,
    description: loaded.post.summary?.slice(0, 155) ?? undefined,
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

  const { post, album } = loaded;

  return (
    <div className="bg-paper">
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
