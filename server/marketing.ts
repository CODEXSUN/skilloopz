import { randomUUID } from "node:crypto";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { db } from "./db";
import { currentUser } from "./session";

const applicationInput = z.object({
  course: z.string().trim().min(1),
  learningMode: z.enum(["Online live", "Online self-paced", "Hybrid"]),
  fullName: z.string().trim().min(1),
  email: z.email(),
  phone: z.string().trim().min(5),
  dateOfBirth: z.string().optional(),
  qualification: z.string().trim().min(1),
  institution: z.string().trim().min(1),
  completionYear: z.string().regex(/^\d{4}$/),
  experience: z.string().optional(),
});

export function registerMarketingRoutes(app: FastifyInstance) {
  app.post("/api/applications", async (request, reply) => {
    const user = await currentUser(request.headers.cookie);
    if (!user) return reply.code(401).send({ error: "Sign in to submit your application" });
    const parsed = applicationInput.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: "Check your application details" });

    const input = parsed.data;
    if (input.email.toLowerCase() !== user.email.toLowerCase()) {
      return reply.code(400).send({ error: "Use the email address linked to your account" });
    }

    const id = randomUUID();
    await db.insertInto("applications").values({
      id,
      user_id: user.id,
      full_name: input.fullName,
      email: input.email,
      program: input.course,
      learning_mode: input.learningMode,
      phone: input.phone,
      date_of_birth: input.dateOfBirth || null,
      qualification: input.qualification,
      institution: input.institution,
      completion_year: input.completionYear,
      experience: input.experience || null,
      created_at: new Date().toISOString(),
    }).execute();
    return reply.code(201).send({ id });
  });

  app.post("/api/newsletter", async (request, reply) => {
    const parsed = z.object({ email: z.email() }).safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: "Enter a valid email address" });
    const email = parsed.data.email.trim().toLowerCase();
    await db.insertInto("newsletter_subscriptions")
      .values({ email, created_at: new Date().toISOString() })
      .onConflict((conflict) => conflict.column("email").doNothing())
      .execute();
    return reply.code(200).send({ success: true });
  });
}
