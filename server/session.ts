import { randomUUID } from "node:crypto";
import { db } from "./db";

const sessionName = "neot_session";
const sessionAgeMs = 7 * 24 * 60 * 60 * 1000;

export function cookieToken(cookieHeader: string | undefined) {
  return cookieHeader?.split(";").map((part) => part.trim())
    .find((part) => part.startsWith(`${sessionName}=`))?.slice(sessionName.length + 1);
}

export async function currentUser(cookieHeader: string | undefined) {
  const token = cookieToken(cookieHeader);
  if (!token) return null;
  const session = await db.selectFrom("sessions")
    .innerJoin("profiles", "profiles.id", "sessions.user_id")
    .select([
      "profiles.id", "profiles.email", "profiles.full_name", "profiles.role",
      "profiles.status", "profiles.age_group", "profiles.avatar_url",
      "profiles.onboarding_completed", "sessions.expires_at",
    ])
    .where("sessions.id", "=", token).executeTakeFirst();
  if (!session || new Date(session.expires_at) <= new Date()) return null;
  return {
    id: session.id,
    email: session.email,
    fullName: session.full_name,
    role: session.role,
    status: session.status,
    ageGroup: session.age_group,
    avatarUrl: session.avatar_url,
    onboardingCompleted: Boolean(session.onboarding_completed),
  };
}

export async function startSession(userId: string) {
  const token = randomUUID();
  await db.insertInto("sessions").values({
    id: token, user_id: userId,
    expires_at: new Date(Date.now() + sessionAgeMs).toISOString(),
  }).execute();
  return `${sessionName}=${token}; HttpOnly; Path=/; Max-Age=${sessionAgeMs / 1000}; SameSite=Lax`;
}

export function expiredSessionCookie() {
  return `${sessionName}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`;
}
