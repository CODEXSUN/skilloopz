import { prisma } from "@/lib/db";

export type SsoProviderData = {
  id: string;
  name: string;
  providerType: string;
  clientId: string;
  clientSecret: string;
  issuerUrl: string | null;
  enabled: boolean;
  buttonLabel: string | null;
  iconUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
};

const OAUTH_ENDPOINTS: Record<string, { authorize: string; token: string; userinfo: string; scopes: string }> = {
  google: {
    authorize: "https://accounts.google.com/o/oauth2/v2/auth",
    token: "https://oauth2.googleapis.com/token",
    userinfo: "https://www.googleapis.com/oauth2/v2/userinfo",
    scopes: "openid email profile",
  },
  microsoft: {
    authorize: "https://login.microsoftonline.com/common/oauth2/v2/authorize",
    token: "https://login.microsoftonline.com/common/oauth2/v2/token",
    userinfo: "https://graph.microsoft.com/v1.0/me",
    scopes: "openid email profile User.Read",
  },
  github: {
    authorize: "https://github.com/login/oauth/authorize",
    token: "https://github.com/login/oauth/access_token",
    userinfo: "https://api.github.com/user",
    scopes: "read:user user:email",
  },
};

export function getOAuthEndpoints(providerType: string, issuerUrl?: string | null) {
  if (issuerUrl) {
    return {
      authorize: `${issuerUrl.replace(/\/$/, "")}/authorize`,
      token: `${issuerUrl.replace(/\/$/, "")}/token`,
      userinfo: `${issuerUrl.replace(/\/$/, "")}/userinfo`,
      scopes: "openid email profile",
    };
  }
  return OAUTH_ENDPOINTS[providerType] || OAUTH_ENDPOINTS.google;
}

export async function getSsoProviders(): Promise<SsoProviderData[]> {
  const providers = await prisma.ssoProvider.findMany({ orderBy: { createdAt: "asc" } });
  return providers.map((p) => ({
    id: p.id,
    name: p.name,
    providerType: p.providerType,
    clientId: p.clientId,
    clientSecret: p.clientSecret,
    issuerUrl: p.issuerUrl,
    enabled: p.enabled,
    buttonLabel: p.buttonLabel,
    iconUrl: p.iconUrl,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  }));
}

export async function getEnabledSsoProviders(): Promise<SsoProviderData[]> {
  const providers = await prisma.ssoProvider.findMany({ where: { enabled: true }, orderBy: { createdAt: "asc" } });
  return providers.map((p) => ({
    id: p.id,
    name: p.name,
    providerType: p.providerType,
    clientId: p.clientId,
    clientSecret: p.clientSecret,
    issuerUrl: p.issuerUrl,
    enabled: p.enabled,
    buttonLabel: p.buttonLabel,
    iconUrl: p.iconUrl,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  }));
}

export async function getSsoProvider(id: string): Promise<SsoProviderData | null> {
  const p = await prisma.ssoProvider.findUnique({ where: { id } });
  if (!p) return null;
  return {
    id: p.id,
    name: p.name,
    providerType: p.providerType,
    clientId: p.clientId,
    clientSecret: p.clientSecret,
    issuerUrl: p.issuerUrl,
    enabled: p.enabled,
    buttonLabel: p.buttonLabel,
    iconUrl: p.iconUrl,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}

export async function createSsoProvider(data: {
  name: string;
  providerType: string;
  clientId: string;
  clientSecret: string;
  issuerUrl?: string;
  enabled?: boolean;
  buttonLabel?: string;
}): Promise<SsoProviderData> {
  const p = await prisma.ssoProvider.create({
    data: {
      name: data.name,
      providerType: data.providerType,
      clientId: data.clientId,
      clientSecret: data.clientSecret,
      issuerUrl: data.issuerUrl || null,
      enabled: data.enabled ?? true,
      buttonLabel: data.buttonLabel || null,
    },
  });
  return {
    id: p.id,
    name: p.name,
    providerType: p.providerType,
    clientId: p.clientId,
    clientSecret: p.clientSecret,
    issuerUrl: p.issuerUrl,
    enabled: p.enabled,
    buttonLabel: p.buttonLabel,
    iconUrl: p.iconUrl,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}

export async function updateSsoProvider(
  id: string,
  data: Partial<{
    name: string;
    providerType: string;
    clientId: string;
    clientSecret: string;
    issuerUrl: string | null;
    enabled: boolean;
    buttonLabel: string | null;
  }>,
): Promise<SsoProviderData | null> {
  const p = await prisma.ssoProvider.update({ where: { id }, data });
  return {
    id: p.id,
    name: p.name,
    providerType: p.providerType,
    clientId: p.clientId,
    clientSecret: p.clientSecret,
    issuerUrl: p.issuerUrl,
    enabled: p.enabled,
    buttonLabel: p.buttonLabel,
    iconUrl: p.iconUrl,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}

export async function deleteSsoProvider(id: string): Promise<void> {
  await prisma.ssoProvider.delete({ where: { id } });
}

export function buildAuthorizeUrl(
  provider: SsoProviderData,
  redirectUri: string,
  state: string,
): string {
  const endpoints = getOAuthEndpoints(provider.providerType, provider.issuerUrl);
  const params = new URLSearchParams({
    client_id: provider.clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: endpoints.scopes,
    state,
  });
  return `${endpoints.authorize}?${params.toString()}`;
}

async function exchangeCode(
  provider: SsoProviderData,
  code: string,
  redirectUri: string,
): Promise<string> {
  const endpoints = getOAuthEndpoints(provider.providerType, provider.issuerUrl);

  const body = new URLSearchParams({
    client_id: provider.clientId,
    client_secret: provider.clientSecret,
    code,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
  });

  const res = await fetch(endpoints.token, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: body.toString(),
  });

  const data = await res.json();
  if (!res.ok || !data.access_token) {
    throw new Error(data.error_description || data.error || "Failed to exchange code");
  }
  return data.access_token;
}

async function fetchUserInfo(
  provider: SsoProviderData,
  accessToken: string,
): Promise<{ id: string; email: string | null; name: string | null }> {
  const endpoints = getOAuthEndpoints(provider.providerType, provider.issuerUrl);

  const res = await fetch(endpoints.userinfo, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) throw new Error("Failed to fetch user info");

  const data = await res.json();

  if (provider.providerType === "google") {
    return { id: data.id, email: data.email || null, name: data.name || null };
  }
  if (provider.providerType === "microsoft") {
    return { id: data.id, email: data.mail || data.userPrincipalName || null, name: data.displayName || null };
  }
  if (provider.providerType === "github") {
    const emailsRes = await fetch("https://api.github.com/user/emails", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    let primaryEmail: string | null = null;
    if (emailsRes.ok) {
      const emails = await emailsRes.json();
      const primary = emails.find((e: { primary: boolean }) => e.primary);
      if (primary) primaryEmail = primary.email;
    }
    return { id: String(data.id), email: primaryEmail || data.email || null, name: data.name || data.login || null };
  }

  return { id: String(data.id || data.sub || ""), email: data.email || null, name: data.name || null };
}

async function findOrCreateUser(
  externalId: string,
  providerId: string,
  email: string | null,
  name: string | null,
): Promise<string> {
  const existing = await prisma.userLink.findUnique({
    where: { providerId_externalId: { providerId, externalId } },
    include: { user: true },
  });

  if (existing) return existing.userId;

  if (email) {
    const profile = await prisma.profile.findFirst({ where: { email } });
    if (profile) {
      await prisma.userLink.create({
        data: { userId: profile.id, providerId, externalId, email },
      });
      return profile.id;
    }
  }

  const newUser = await prisma.profile.create({
    data: {
      id: crypto.randomUUID(),
      email,
      fullName: name || null,
      role: "student",
      emailVerified: email ? new Date() : null,
    },
  });

  await prisma.userLink.create({
    data: { userId: newUser.id, providerId, externalId, email },
  });

  return newUser.id;
}

export async function handleSsoCallback(
  provider: SsoProviderData,
  code: string,
  redirectUri: string,
): Promise<{ userId: string; email: string | null; name: string | null }> {
  const accessToken = await exchangeCode(provider, code, redirectUri);
  const userInfo = await fetchUserInfo(provider, accessToken);
  const userId = await findOrCreateUser(userInfo.id, provider.id, userInfo.email, userInfo.name);
  return { userId, email: userInfo.email, name: userInfo.name };
}
