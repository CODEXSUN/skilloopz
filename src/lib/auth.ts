import { cookies } from "next/headers";
import { compareSync, hashSync } from "bcryptjs";
import { prisma } from "@/lib/db";

const SESSION_COOKIE = "neot_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export type AuthUser = {
  id: string;
  email: string | null;
  emailVerified: string | null;
  fullName: string | null;
  role: string;
  status: string;
  ageGroup: string | null;
  avatarUrl: string | null;
  onboardingCompleted: boolean;
  schoolId: string | null;
};

export function hashPassword(password: string): string {
  return hashSync(password, 10);
}

export function verifyPassword(password: string, hash: string): boolean {
  return compareSync(password, hash);
}

export async function createSession(userId: string): Promise<string> {
  const token = crypto.randomUUID();
  await prisma.session.create({
    data: {
      id: token,
      userId,
      expiresAt: new Date(Date.now() + SESSION_TTL_MS),
    },
  });
  return token;
}

export async function deleteSession(token: string): Promise<void> {
  await prisma.session.deleteMany({ where: { id: token } });
}

export async function getUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    if (!token) return null;

    const session = await prisma.session.findUnique({
      where: { id: token },
      include: { user: true },
    });

    if (!session || session.expiresAt < new Date()) {
      if (session) await deleteSession(token);
      return null;
    }

    return {
      id: session.user.id,
      email: session.user.email,
      fullName: session.user.fullName,
      role: session.user.role,
      status: session.user.status,
      ageGroup: session.user.ageGroup,
      avatarUrl: session.user.avatarUrl,
      onboardingCompleted: session.user.onboardingCompleted,
      schoolId: session.user.schoolId,
      emailVerified: session.user.emailVerified?.toISOString() ?? null,
    };
  } catch {
    return null;
  }
}

export async function getUserId(): Promise<string | null> {
  const user = await getUser();
  return user?.id ?? null;
}

export function getSessionCookieName(): string {
  return SESSION_COOKIE;
}

export function getSessionCookieValue(token: string): string {
  return `${SESSION_COOKIE}=${token}; HttpOnly; Path=/; Max-Age=${SESSION_TTL_MS / 1000}; SameSite=Lax`;
}
