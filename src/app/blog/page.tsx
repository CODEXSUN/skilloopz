import { Metadata } from "next";
import Image from "next/image";
import { PublicLayout } from "@/components/layout/public-layout";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowRight, Calendar, User } from "lucide-react";
import { buildPageMetadata, getGlobalSeoSettings } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const global = await getGlobalSeoSettings();
  return buildPageMetadata(
    undefined,
    { title: "Blog & Insights", description: "Latest updates, tips, and stories from our learning community" },
    global,
  );
}

export default async function BlogPage() {
  const posts = await prisma.blogPost.findMany({
    where: { status: "published" },
    include: {
      author: { select: { id: true, fullName: true, avatarUrl: true } },
    },
    orderBy: { publishedAt: "desc" },
  }).catch(() => []);

  return (
    <PublicLayout>
      <main className="bg-background text-foreground">
        <section className="relative overflow-hidden px-6 py-24">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(79,124,255,0.06)_0%,transparent_60%)]" />

          <div className="mx-auto max-w-4xl">
            <div className="mb-12 text-center">
              <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl">
                Blog & <span className="gradient-text-accent">Insights</span>
              </h1>
              <p className="mt-3 text-lg text-muted-foreground">
                Latest updates, tips, and stories from our learning community.
              </p>
            </div>

            {posts.length === 0 ? (
              <div className="relative overflow-hidden rounded-2xl border border-white/10 py-20 text-center text-white">
                <Image src="/images/fallbacks/learning-card.webp" alt="A visual library of practical learning projects" fill sizes="(min-width: 896px) 896px, 100vw" className="object-cover opacity-35" />
                <div className="absolute inset-0 bg-background/75" />
                <div className="relative"><p className="text-lg font-semibold">New stories are being prepared.</p><p className="mt-2 text-sm text-muted-foreground">Check back soon for practical guides and learner perspectives.</p></div>
              </div>
            ) : (
              <div className="space-y-8">
                {posts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="group block rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-6 transition-all hover:border-[rgba(255,255,255,0.12)] hover:bg-[rgba(255,255,255,0.04)]"
                  >
                    <div className="relative mb-4 h-48 w-full overflow-hidden rounded-xl">
                      <Image src={post.coverImage ?? "/images/fallbacks/learning-card.webp"} alt={post.title} fill sizes="(min-width: 896px) 896px, 100vw" className="object-cover transition-transform group-hover:scale-105" />
                    </div>
                    <h2 className="font-heading text-xl font-bold text-foreground group-hover:text-primary-400 transition-colors">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                        {post.excerpt}
                      </p>
                    )}
                    <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {post.author.fullName ?? "Author"}
                      </span>
                      {post.publishedAt && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(post.publishedAt), "MMM d, yyyy")}
                        </span>
                      )}
                    </div>
                    <div className="mt-3 flex items-center gap-1 text-sm font-medium text-primary-400">
                      Read more
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </PublicLayout>
  );
}
