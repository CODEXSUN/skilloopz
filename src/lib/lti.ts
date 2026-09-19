import { prisma } from "@/lib/db";

export type LtiRegistrationData = {
  id: string;
  name: string;
  issuer: string;
  clientId: string;
  deploymentId: string;
  authUrl: string;
  tokenUrl: string;
  keysetUrl: string;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export async function getLtiRegistrations(): Promise<LtiRegistrationData[]> {
  const regs = await prisma.ltiRegistration.findMany({ orderBy: { createdAt: "asc" } });
  return regs.map((r) => ({
    id: r.id,
    name: r.name,
    issuer: r.issuer,
    clientId: r.clientId,
    deploymentId: r.deploymentId,
    authUrl: r.authUrl,
    tokenUrl: r.tokenUrl,
    keysetUrl: r.keysetUrl,
    enabled: r.enabled,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  }));
}

export async function getLtiRegistration(id: string): Promise<LtiRegistrationData | null> {
  const r = await prisma.ltiRegistration.findUnique({ where: { id } });
  if (!r) return null;
  return {
    id: r.id,
    name: r.name,
    issuer: r.issuer,
    clientId: r.clientId,
    deploymentId: r.deploymentId,
    authUrl: r.authUrl,
    tokenUrl: r.tokenUrl,
    keysetUrl: r.keysetUrl,
    enabled: r.enabled,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}

export async function findLtiRegistration(issuer: string, clientId: string): Promise<LtiRegistrationData | null> {
  const r = await prisma.ltiRegistration.findFirst({ where: { issuer, clientId } });
  if (!r) return null;
  return {
    id: r.id,
    name: r.name,
    issuer: r.issuer,
    clientId: r.clientId,
    deploymentId: r.deploymentId,
    authUrl: r.authUrl,
    tokenUrl: r.tokenUrl,
    keysetUrl: r.keysetUrl,
    enabled: r.enabled,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}

export async function createLtiRegistration(data: {
  name: string;
  issuer: string;
  clientId: string;
  deploymentId: string;
  authUrl: string;
  tokenUrl: string;
  keysetUrl: string;
  enabled?: boolean;
}): Promise<LtiRegistrationData> {
  const r = await prisma.ltiRegistration.create({ data });
  return {
    id: r.id,
    name: r.name,
    issuer: r.issuer,
    clientId: r.clientId,
    deploymentId: r.deploymentId,
    authUrl: r.authUrl,
    tokenUrl: r.tokenUrl,
    keysetUrl: r.keysetUrl,
    enabled: r.enabled,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}

export async function updateLtiRegistration(
  id: string,
  data: Partial<{
    name: string;
    issuer: string;
    clientId: string;
    deploymentId: string;
    authUrl: string;
    tokenUrl: string;
    keysetUrl: string;
    enabled: boolean;
  }>,
): Promise<LtiRegistrationData | null> {
  const r = await prisma.ltiRegistration.update({ where: { id }, data });
  return {
    id: r.id,
    name: r.name,
    issuer: r.issuer,
    clientId: r.clientId,
    deploymentId: r.deploymentId,
    authUrl: r.authUrl,
    tokenUrl: r.tokenUrl,
    keysetUrl: r.keysetUrl,
    enabled: r.enabled,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}

export async function deleteLtiRegistration(id: string): Promise<void> {
  await prisma.ltiRegistration.delete({ where: { id } });
}

export function getNeotKeysetUrl(): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
  return `${baseUrl}/api/lti/keyset`;
}

export function getNeotLaunchUrl(): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
  return `${baseUrl}/api/lti/launch`;
}

export function getNeotOidcUrl(): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
  return `${baseUrl}/api/lti/oidc`;
}

export function getNeotDeepLinkUrl(): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
  return `${baseUrl}/api/lti/deep-link`;
}
