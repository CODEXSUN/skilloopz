import { prisma } from "@/lib/db";
import { SeoPage } from "@/components/admin/seo/seo-page";

export default async function AdminSeoPage() {
  const settings = await prisma.platformSetting.findMany({
    where: { group: "seo" },
  });

  const values: Record<string, string> = {};
  for (const s of settings) {
    values[s.key] = s.value;
  }

  return <SeoPage initialValues={values} />;
}
