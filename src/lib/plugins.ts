import { prisma } from "@/lib/db";

export type PluginData = {
  id: string;
  name: string;
  slug: string;
  description: string;
  version: string;
  author: string;
  enabled: boolean;
  config: string;
  hooks: string;
  webhookUrl: string | null;
  iconUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type PluginHook =
  | "before_login"
  | "after_login"
  | "before_signup"
  | "after_signup"
  | "before_purchase"
  | "after_purchase"
  | "before_course_publish"
  | "after_course_publish"
  | "before_lesson_complete"
  | "after_lesson_complete"
  | "on_xp_award"
  | "on_badge_unlock"
  | "on_notification"
  | "on_webhook_dispatch"
  | "custom";

export async function getPlugins(): Promise<PluginData[]> {
  const plugins = await prisma.plugin.findMany({ orderBy: { name: "asc" } });
  return plugins.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    version: p.version,
    author: p.author,
    enabled: p.enabled,
    config: p.config,
    hooks: p.hooks,
    webhookUrl: p.webhookUrl,
    iconUrl: p.iconUrl,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  }));
}

export async function getPlugin(slug: string): Promise<PluginData | null> {
  const p = await prisma.plugin.findUnique({ where: { slug } });
  if (!p) return null;
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    version: p.version,
    author: p.author,
    enabled: p.enabled,
    config: p.config,
    hooks: p.hooks,
    webhookUrl: p.webhookUrl,
    iconUrl: p.iconUrl,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}

export async function getEnabledPlugins(): Promise<PluginData[]> {
  const plugins = await prisma.plugin.findMany({ where: { enabled: true } });
  return plugins.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    version: p.version,
    author: p.author,
    enabled: p.enabled,
    config: p.config,
    hooks: p.hooks,
    webhookUrl: p.webhookUrl,
    iconUrl: p.iconUrl,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  }));
}

export async function getPluginsByHook(hook: PluginHook): Promise<PluginData[]> {
  const plugins = await prisma.plugin.findMany({
    where: { enabled: true, hooks: { contains: hook } },
  });
  return plugins.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    version: p.version,
    author: p.author,
    enabled: p.enabled,
    config: p.config,
    hooks: p.hooks,
    webhookUrl: p.webhookUrl,
    iconUrl: p.iconUrl,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  }));
}

export async function createPlugin(data: {
  name: string;
  slug: string;
  description: string;
  author: string;
  version?: string;
  config?: string;
  hooks?: string;
  webhookUrl?: string;
  iconUrl?: string;
}): Promise<PluginData> {
  const p = await prisma.plugin.create({ data });
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    version: p.version,
    author: p.author,
    enabled: p.enabled,
    config: p.config,
    hooks: p.hooks,
    webhookUrl: p.webhookUrl,
    iconUrl: p.iconUrl,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}

export async function updatePlugin(
  slug: string,
  data: Partial<{
    name: string;
    description: string;
    version: string;
    author: string;
    enabled: boolean;
    config: string;
    hooks: string;
    webhookUrl: string | null;
    iconUrl: string | null;
  }>,
): Promise<PluginData | null> {
  const p = await prisma.plugin.update({ where: { slug }, data });
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    version: p.version,
    author: p.author,
    enabled: p.enabled,
    config: p.config,
    hooks: p.hooks,
    webhookUrl: p.webhookUrl,
    iconUrl: p.iconUrl,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}

export async function deletePlugin(slug: string): Promise<void> {
  await prisma.plugin.delete({ where: { slug } });
}

export async function triggerHook(hook: PluginHook, payload: Record<string, unknown>): Promise<void> {
  const plugins = await getPluginsByHook(hook);

  for (const plugin of plugins) {
    if (plugin.webhookUrl) {
      try {
        await fetch(plugin.webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ hook, plugin: plugin.slug, payload }),
          signal: AbortSignal.timeout(5000),
        });
      } catch {
        console.error(`Plugin webhook failed: ${plugin.slug} (${hook})`);
      }
    }
  }
}

export async function getPluginConfig(slug: string): Promise<Record<string, unknown>> {
  const plugin = await getPlugin(slug);
  if (!plugin) return {};
  try {
    return JSON.parse(plugin.config);
  } catch {
    return {};
  }
}

export async function updatePluginConfig(slug: string, config: Record<string, unknown>): Promise<void> {
  await prisma.plugin.update({
    where: { slug },
    data: { config: JSON.stringify(config) },
  });
}
