import { prisma } from "@/lib/db";

export interface AnalyticsConfig {
  enabled: boolean;
  ga4Id: string;
  mixpanelToken: string;
}

export async function getAnalyticsConfig(): Promise<AnalyticsConfig> {
  try {
    const settings = await prisma.platformSetting.findMany({
      where: { group: "analytics" },
    });

    const values: Record<string, string> = {};
    for (const s of settings) values[s.key] = s.value;

    return {
      enabled: values.analytics_enabled === "true",
      ga4Id: values.analytics_ga4_id ?? "",
      mixpanelToken: values.analytics_mixpanel_token ?? "",
    };
  } catch {
    return { enabled: false, ga4Id: "", mixpanelToken: "" };
  }
}

export async function saveAnalyticsConfig(config: Partial<AnalyticsConfig>): Promise<void> {
  const upserts = [
    { key: "analytics_enabled", value: String(config.enabled ?? false) },
    { key: "analytics_ga4_id", value: config.ga4Id ?? "" },
    { key: "analytics_mixpanel_token", value: config.mixpanelToken ?? "" },
  ];

  for (const { key, value } of upserts) {
    await prisma.platformSetting.upsert({
      where: { key },
      create: { key, value, group: "analytics" },
      update: { value },
    });
  }
}
