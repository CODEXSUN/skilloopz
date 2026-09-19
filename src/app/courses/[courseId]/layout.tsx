import { buildPageMetadata, getGlobalSeoSettings } from "@/lib/seo";
import { prisma } from "@/lib/db";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ courseId: string }>;
}): Promise<Metadata> {
  const { courseId } = await params;
  const global = await getGlobalSeoSettings();

  try {
    const course = await prisma.course.findUnique({
      where: { id: courseId, status: "published" },
      include: { teacher: { select: { fullName: true } } },
    });

    if (course) {
      return buildPageMetadata(
        undefined,
        {
          title: course.title,
          description: course.description || global.metaDescription,
          image: course.thumbnailUrl || global.ogImage,
        },
        global,
      );
    }
  } catch {
    // ignore
  }

  return {
    title: `Course — ${global.siteTitle}`,
    description: global.metaDescription,
    robots: { index: true, follow: true },
    openGraph: {
      title: `Course — ${global.siteTitle}`,
      description: global.metaDescription,
      type: "website",
    },
  };
}

export default function CourseLayout({ children }: { children: React.ReactNode }) {
  return children;
}