import { MetadataRoute } from "next";
import { prisma } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/courses`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/features`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/pricing`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
  ];

  let customPages: MetadataRoute.Sitemap = [];
  try {
    const pages = await prisma.customPage.findMany({
      where: { status: "published" },
      orderBy: { updatedAt: "desc" },
    });
    customPages = pages.map((p) => ({
      url: `${baseUrl}${p.path}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));
  } catch {
    // ignore
  }

  let courses: MetadataRoute.Sitemap = [];
  try {
    const published = await prisma.course.findMany({
      where: { status: "published" },
      orderBy: { updatedAt: "desc" },
    });
    courses = published.map((c) => ({
      url: `${baseUrl}/courses/${c.id}`,
      lastModified: c.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch {
    // ignore
  }

  let blogPosts: MetadataRoute.Sitemap = [];
  try {
    const posts = await prisma.blogPost.findMany({
      where: { status: "published" },
      orderBy: { publishedAt: "desc" },
    });
    blogPosts = posts
      .filter((p) => p.publishedAt != null)
      .map((p) => ({
        url: `${baseUrl}/blog/${p.slug}`,
        lastModified: p.updatedAt,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      }));
  } catch {
    // ignore
  }

  return [...staticPages, ...customPages, ...courses, ...blogPosts];
}
