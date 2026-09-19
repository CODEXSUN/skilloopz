import { Metadata } from "next";
import { prisma } from "@/lib/db";

export interface GlobalSeoSettings {
  siteTitle: string;
  metaDescription: string;
  ogImage: string;
}

export async function getGlobalSeoSettings(): Promise<GlobalSeoSettings> {
  const settings = await prisma.platformSetting
    .findMany({
      where: { group: "seo" },
    })
    .catch(() => []);

  const map: Record<string, string> = {};
  for (const s of settings) {
    map[s.key] = s.value;
  }

  return {
    siteTitle: map["site_title"] ?? "skilloopz",
    metaDescription:
      map["meta_description"] ?? "Learning that adapts to humans.",
    ogImage: map["og_image"] ?? "/og-image.png",
  };
}

export function buildPageMetadata(
  seo: Record<string, unknown> | undefined,
  defaults: { title: string; description?: string; image?: string },
  global: GlobalSeoSettings,
): Metadata {
  const title = (seo?.metaTitle as string) || defaults.title;
  const description =
    (seo?.metaDescription as string) ||
    defaults.description ||
    global.metaDescription;
  const ogImage = (seo?.ogImage as string) || defaults.image || global.ogImage;
  const canonicalUrl = seo?.canonicalUrl as string | undefined;
  const noindex = seo?.robotsNoindex === true;
  const nofollow = seo?.robotsNofollow === true;
  const structuredData = seo?.structuredData as string | undefined;

  const fullTitle = title.includes(global.siteTitle)
    ? title
    : `${title} — ${global.siteTitle}`;

  const metadata: Metadata = {
    title: fullTitle,
    description,
    robots: {
      index: !noindex,
      follow: !nofollow,
    },
    openGraph: {
      title: (seo?.ogTitle as string) || title,
      description: (seo?.ogDescription as string) || description,
      images: ogImage ? [{ url: ogImage }] : undefined,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: (seo?.ogTitle as string) || title,
      description: (seo?.ogDescription as string) || description,
      images: ogImage ? [ogImage] : undefined,
    },
  };

  if (canonicalUrl) {
    metadata.alternates = { canonical: canonicalUrl };
  }

  if (structuredData) {
    (metadata as Record<string, unknown>).other = {
      "application/ld+json": structuredData,
    };
  }

  return metadata;
}
