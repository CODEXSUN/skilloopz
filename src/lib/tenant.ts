import { prisma } from "@/lib/db";

export interface TenantContext {
  id: string;
  name: string;
  slug: string;
  plan: string;
  settings: Record<string, unknown>;
}

export async function resolveTenant(hostname: string): Promise<TenantContext | null> {
  const slug = hostname.split(".")[0];

  if (!slug || slug === "www" || slug === "app") {
    return null;
  }

  const tenant = await prisma.tenant.findUnique({
    where: { slug },
  });

  if (!tenant || tenant.status !== "active") {
    return null;
  }

  return {
    id: tenant.id,
    name: tenant.name,
    slug: tenant.slug,
    plan: tenant.plan,
    settings: JSON.parse(tenant.settings),
  };
}

export async function resolveTenantByDomain(domain: string): Promise<TenantContext | null> {
  const tenant = await prisma.tenant.findFirst({
    where: {
      customDomain: domain,
      status: "active",
    },
  });

  if (!tenant) return null;

  return {
    id: tenant.id,
    name: tenant.name,
    slug: tenant.slug,
    plan: tenant.plan,
    settings: JSON.parse(tenant.settings),
  };
}

export function getTenantWhere(tenantId: string | null): Record<string, unknown> {
  if (!tenantId) return {};
  return { tenantId };
}
