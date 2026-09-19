import { prisma } from "@/lib/db";

export type MarketplaceAppData = {
  id: string;
  name: string;
  description: string;
  developer: string;
  developerUrl: string | null;
  iconUrl: string | null;
  category: string;
  tags: string;
  version: string;
  configSchema: string;
  webhookUrl: string | null;
  status: string;
  installCount: number;
  rating: number;
  ratingCount: number;
  createdAt: Date;
  updatedAt: Date;
};

export async function getMarketplaceApps(status?: string): Promise<MarketplaceAppData[]> {
  const apps = await prisma.marketplaceApp.findMany({
    where: status ? { status } : undefined,
    orderBy: { installCount: "desc" },
  });
  return apps.map((a) => ({
    id: a.id,
    name: a.name,
    description: a.description,
    developer: a.developer,
    developerUrl: a.developerUrl,
    iconUrl: a.iconUrl,
    category: a.category,
    tags: a.tags,
    version: a.version,
    configSchema: a.configSchema,
    webhookUrl: a.webhookUrl,
    status: a.status,
    installCount: a.installCount,
    rating: a.rating,
    ratingCount: a.ratingCount,
    createdAt: a.createdAt,
    updatedAt: a.updatedAt,
  }));
}

export async function getMarketplaceApp(id: string): Promise<MarketplaceAppData | null> {
  const a = await prisma.marketplaceApp.findUnique({ where: { id } });
  if (!a) return null;
  return {
    id: a.id,
    name: a.name,
    description: a.description,
    developer: a.developer,
    developerUrl: a.developerUrl,
    iconUrl: a.iconUrl,
    category: a.category,
    tags: a.tags,
    version: a.version,
    configSchema: a.configSchema,
    webhookUrl: a.webhookUrl,
    status: a.status,
    installCount: a.installCount,
    rating: a.rating,
    ratingCount: a.ratingCount,
    createdAt: a.createdAt,
    updatedAt: a.updatedAt,
  };
}

export async function createMarketplaceApp(data: {
  name: string;
  description: string;
  developer: string;
  developerUrl?: string;
  iconUrl?: string;
  category?: string;
  tags?: string;
  version?: string;
  configSchema?: string;
  webhookUrl?: string;
}): Promise<MarketplaceAppData> {
  const a = await prisma.marketplaceApp.create({ data });
  return {
    id: a.id,
    name: a.name,
    description: a.description,
    developer: a.developer,
    developerUrl: a.developerUrl,
    iconUrl: a.iconUrl,
    category: a.category,
    tags: a.tags,
    version: a.version,
    configSchema: a.configSchema,
    webhookUrl: a.webhookUrl,
    status: a.status,
    installCount: a.installCount,
    rating: a.rating,
    ratingCount: a.ratingCount,
    createdAt: a.createdAt,
    updatedAt: a.updatedAt,
  };
}

export async function updateMarketplaceApp(
  id: string,
  data: Partial<{
    name: string;
    description: string;
    developer: string;
    developerUrl: string | null;
    iconUrl: string | null;
    category: string;
    tags: string;
    version: string;
    configSchema: string;
    webhookUrl: string | null;
    status: string;
  }>,
): Promise<MarketplaceAppData | null> {
  const a = await prisma.marketplaceApp.update({ where: { id }, data });
  return {
    id: a.id,
    name: a.name,
    description: a.description,
    developer: a.developer,
    developerUrl: a.developerUrl,
    iconUrl: a.iconUrl,
    category: a.category,
    tags: a.tags,
    version: a.version,
    configSchema: a.configSchema,
    webhookUrl: a.webhookUrl,
    status: a.status,
    installCount: a.installCount,
    rating: a.rating,
    ratingCount: a.ratingCount,
    createdAt: a.createdAt,
    updatedAt: a.updatedAt,
  };
}

export async function deleteMarketplaceApp(id: string): Promise<void> {
  await prisma.marketplaceApp.delete({ where: { id } });
}

export async function installApp(appId: string, userId: string, schoolId: string | null, config?: Record<string, unknown>): Promise<void> {
  await prisma.appInstallation.create({
    data: {
      appId,
      userId,
      schoolId,
      config: config ? JSON.stringify(config) : "{}",
    },
  });
  await prisma.marketplaceApp.update({
    where: { id: appId },
    data: { installCount: { increment: 1 } },
  });
}

export async function uninstallApp(appId: string, userId: string, schoolId: string | null): Promise<void> {
  await prisma.appInstallation.deleteMany({
    where: { appId, userId, schoolId },
  });
  await prisma.marketplaceApp.update({
    where: { id: appId },
    data: { installCount: { decrement: 1 } },
  });
}

export async function getUserInstallations(userId: string): Promise<
  {
    id: string;
    appId: string;
    schoolId: string | null;
    config: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    app: { name: string; description: string; iconUrl: string | null; category: string };
  }[]
> {
  return prisma.appInstallation.findMany({
    where: { userId },
    include: {
      app: { select: { name: true, description: true, iconUrl: true, category: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}
