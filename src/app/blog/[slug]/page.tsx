import { PublicLayout } from "@/components/layout/public-layout";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { format } from "date-fns";
import Link from "next/link";
import { ArrowLeft, Calendar, User } from "lucide-react";
import { buildPageMetadata, getGlobalSeoSettings } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const global = await getGlobalSeoSettings();

  const post = await prisma.blogPost.findUnique({
    where: { slug, status: "published" },
  }).catch(() => null);

  if (!post) return {};

  const title = post.title;
  const description = post.excerpt || post.content.slice(0, 160);
  const image = post.coverImage || global.ogImage;

  return buildPageMetadata(
    undefined,
    { title, description, image },
    global,
  );
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const post = await prisma.blogPost.findUnique({
    where: { slug, status: "published" },
    include: {
      author: { select: { id: true, fullName: true, avatarUrl: true } },
    },
  });

  if (!post) notFound();

  return (
    <PublicLayout>
      <main className="bg-background text-foreground">
        <article className="relative overflow-hidden px-6 py-16">
          <div className="mx-auto max-w-3xl">
            <Link
              href="/blog"
              className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Blog
            </Link>

            {post.coverImage && (
              <div className="mb-8 h-64 w-full overflow-hidden rounded-2xl sm:h-80">
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl text-foreground">
              {post.title}
            </h1>

            <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {post.author.fullName ?? "Author"}
              </span>
              {post.publishedAt && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(post.publishedAt), "MMMM d, yyyy")}
                </span>
              )}
            </div>

            {post.excerpt && (
              <p className="mt-6 text-lg text-muted-foreground italic border-l-4 border-primary-500/30 pl-4">
                {post.excerpt}
              </p>
            )}

            <div className="mt-8 prose prose-invert max-w-none">
              {post.content.split("\n").map((paragraph: string, i: number) => (
                <p key={i} className="text-foreground leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </article>
      </main>
    </PublicLayout>
  );
}
