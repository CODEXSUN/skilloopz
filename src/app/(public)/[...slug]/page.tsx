import { notFound } from "next/navigation";
import { Metadata } from "next";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { PageRenderer } from "@/components/blocks/page-renderer";
import { buildPageMetadata, getGlobalSeoSettings } from "@/lib/seo";

interface PageProps {
  params: Promise<{ slug: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const path = "/" + slug.join("/");
  const [page, global] = await Promise.all([
    prisma.customPage.findFirst({
      where: { path, status: "published" },
    }).catch(() => null),
    getGlobalSeoSettings(),
  ]);
  if (!page) return {};
  const seo = JSON.parse((page as { seo?: string }).seo ?? "{}") as Record<string, unknown>;
  return buildPageMetadata(
    Object.keys(seo).length > 0 ? seo : undefined,
    { title: page.title },
    global,
  );
}

export default async function SlugPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const path = "/" + slug.join("/");

  const cookieStore = await cookies();
  const previewMode = cookieStore.get("preview_mode")?.value === "1";

  const sp = await searchParams;
  const hasPreviewParam = sp.preview === "1";

  const showDraft = previewMode || hasPreviewParam;

  let page;
  try {
    page = await prisma.customPage.findFirst({
      where: showDraft ? { path } : { path, status: "published" },
      include: { sections: { orderBy: { sortOrder: "asc" } } },
    });
  } catch {
    notFound();
  }

  if (!page) notFound();

  const sections = page.sections.map((s: { id: string; blockType: string; content: string }) => ({
    id: s.id,
    blockType: s.blockType,
    content: JSON.parse(s.content) as Record<string, unknown>,
  }));

  return (
    <main className="min-h-screen bg-background text-foreground">
      <PageRenderer sections={sections} />
    </main>
  );
}
