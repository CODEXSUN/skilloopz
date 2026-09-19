import { randomUUID } from "node:crypto";
import Fastify from "fastify";
import { compareSync, hashSync } from "bcryptjs";
import { z } from "zod";
import { db, initializeDatabase } from "./db";
import { cookieToken, currentUser, expiredSessionCookie, startSession } from "./session";
import { registerLearningRoutes } from "./learning";
import { registerMarketingRoutes } from "./marketing";

const app = Fastify({ logger: true });

const credentialsSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});

app.get("/api/auth/me", async (request, reply) => {
  const user = await currentUser(request.headers.cookie);
  if (!user) return reply.code(401).send({ error: "Unauthorized" });
  return { user };
});

app.post("/api/auth/signup", async (request, reply) => {
  const parsed = credentialsSchema.extend({
    fullName: z.string().optional(),
    role: z.enum(["student", "teacher", "parent"]).default("student"),
    ageGroup: z.string().optional(),
  }).safeParse(request.body);
  if (!parsed.success) return reply.code(400).send({ error: "Invalid input" });
  const { email, password, fullName, role, ageGroup } = parsed.data;
  const existing = await db.selectFrom("profiles").select("id").where("email", "=", email).executeTakeFirst();
  if (existing) return reply.code(409).send({ error: "An account with this email already exists" });
  const id = randomUUID();
  await db.insertInto("profiles").values({
    id, email, full_name: fullName ?? null, password_hash: hashSync(password, 10),
    role, status: "active", age_group: ageGroup ?? null, avatar_url: null,
    onboarding_completed: 0, metadata: "{}", created_at: new Date().toISOString(),
  }).execute();
  reply.header("Set-Cookie", await startSession(id));
  return reply.code(201).send({ success: true });
});

app.post("/api/auth/login", async (request, reply) => {
  const parsed = credentialsSchema.safeParse(request.body);
  if (!parsed.success) return reply.code(400).send({ error: "Invalid input" });
  const profile = await db.selectFrom("profiles").selectAll().where("email", "=", parsed.data.email).executeTakeFirst();
  if (!profile || !compareSync(parsed.data.password, profile.password_hash)) {
    return reply.code(401).send({ error: "Invalid email or password" });
  }
  if (profile.status !== "active") return reply.code(403).send({ error: "Account unavailable" });
  reply.header("Set-Cookie", await startSession(profile.id));
  return { success: true };
});

app.post("/api/auth/logout", async (request, reply) => {
  const token = cookieToken(request.headers.cookie);
  if (token) await db.deleteFrom("sessions").where("id", "=", token).execute();
  reply.header("Set-Cookie", expiredSessionCookie());
  return { success: true };
});

registerLearningRoutes(app);
registerMarketingRoutes(app);

initializeDatabase();
app.listen({ port: Number(process.env.API_PORT ?? 3002), host: "127.0.0.1" })
  .catch((error: unknown) => {
    app.log.error(error);
    process.exitCode = 1;
  });
