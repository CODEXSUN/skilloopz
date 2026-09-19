import { Metadata } from "next";
import { PublicLayout } from "@/components/layout/public-layout";
import { CoursesContent } from "@/components/courses/courses-content";
import { buildPageMetadata, getGlobalSeoSettings } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const global = await getGlobalSeoSettings();
  return buildPageMetadata(
    undefined,
    { title: "Courses", description: "Browse our catalog of adaptive courses" },
    global,
  );
}

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>;
}) {
  const { tag } = await searchParams;

  return (
    <PublicLayout>
      <CoursesContent initialTag={tag} />
    </PublicLayout>
  );
}
