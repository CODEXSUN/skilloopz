import { prisma } from "@/lib/db";

export interface CdnConfig {
  enabled: boolean;
  url: string;
  mediaPrefix: string;
  staticAssetsPrefix: string;
}

const DEFAULT_CONFIG: CdnConfig = {
  enabled: false,
  url: "",
  mediaPrefix: "/media",
  staticAssetsPrefix: "/assets",
};

export async function getCdnConfig(): Promise<CdnConfig> {
  try {
    const settings = await prisma.platformSetting.findMany({
      where: { group: "cdn" },
    });

    const values: Record<string, string> = {};
    for (const s of settings) values[s.key] = s.value;

    return {
      enabled: values.cdn_enabled === "true",
      url: values.cdn_url ?? "",
      mediaPrefix: values.cdn_media_prefix ?? "/media",
      staticAssetsPrefix: values.cdn_static_prefix ?? "/assets",
    };
  } catch {
    return DEFAULT_CONFIG;
  }
}

export async function saveCdnConfig(config: Partial<CdnConfig>): Promise<void> {
  const upserts = [
    { key: "cdn_enabled", value: String(config.enabled ?? false) },
    { key: "cdn_url", value: config.url ?? "" },
    { key: "cdn_media_prefix", value: config.mediaPrefix ?? "/media" },
    { key: "cdn_static_prefix", value: config.staticAssetsPrefix ?? "/assets" },
  ];

  for (const { key, value } of upserts) {
    await prisma.platformSetting.upsert({
      where: { key },
      create: { key, value, group: "cdn" },
      update: { value },
    });
  }
}

export function buildCdnUrl(config: CdnConfig, path: string): string {
  if (!config.enabled || !config.url) return path;
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  return `${config.url.replace(/\/$/, "")}/${cleanPath}`;
}

export function transformMediaUrl(config: CdnConfig, mediaUrl: string | null | undefined): string | null {
  if (!mediaUrl) return null;
  if (!config.enabled || !config.url) return mediaUrl;
  if (mediaUrl.startsWith("http")) return mediaUrl;
  return buildCdnUrl(config, mediaUrl);
}

export function isCdnConfigured(config: CdnConfig): boolean {
  return config.enabled && config.url.length > 0;
}
