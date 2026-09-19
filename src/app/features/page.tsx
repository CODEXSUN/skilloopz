import { Metadata } from "next";
import { PublicLayout } from "@/components/layout/public-layout";
import { FeaturesContent } from "@/components/features/features-content";
import { buildPageMetadata, getGlobalSeoSettings } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const global = await getGlobalSeoSettings();
  return buildPageMetadata(
    undefined,
    { title: "Features", description: "Discover the adaptive features that make NEOT unique" },
    global,
  );
}

export default function FeaturesPage() {
  return (
    <PublicLayout>
      <FeaturesContent />
    </PublicLayout>
  );
}
