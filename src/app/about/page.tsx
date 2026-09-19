import { Metadata } from "next";
import { PublicLayout } from "@/components/layout/public-layout";
import { AboutContent } from "@/components/about/about-content";
import { buildPageMetadata, getGlobalSeoSettings } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const global = await getGlobalSeoSettings();
  return buildPageMetadata(
    undefined,
    {
      title: "About",
      description: "Learn about skilloopz — the practical learning platform",
    },
    global,
  );
}

export default function AboutPage() {
  return (
    <PublicLayout>
      <AboutContent />
    </PublicLayout>
  );
}
