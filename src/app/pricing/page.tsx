import { Metadata } from "next";
import { PublicLayout } from "@/components/layout/public-layout";
import { PricingContent } from "@/components/pricing/pricing-content";
import { buildPageMetadata, getGlobalSeoSettings } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const global = await getGlobalSeoSettings();
  return buildPageMetadata(
    undefined,
    { title: "Pricing", description: "Choose the plan that fits your learning journey" },
    global,
  );
}

export default function PricingPage() {
  return (
    <PublicLayout>
      <PricingContent />
    </PublicLayout>
  );
}
