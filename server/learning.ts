import { randomUUID } from "node:crypto";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { db } from "./db";
import { currentUser } from "./session";

const courseInput = z.object({
  title: z.string().trim().min(1),
  description: z.string().optional(),
  categoryId: z.string().optional(),
  subject: z.string().optional(),
  gradeLevel: z.string().optional(),
  difficulty: z.string().optional(),
  estimatedMinutes: z.number().int().nonnegative().optional(),
});

async function courseView(course: Awaited<ReturnType<typeof courseRows>>[number]) {
  const [modules, enrollments] = await Promise.all([
    db.selectFrom("modules").select("id").where("course_id", "=", course.id).execute(),
    db.selectFrom("enrollments").select("id").where("course_id", "=", course.id).execute(),
  ]);
  return {
    id: course.id, title: course.title, description: course.description,
    thumbnailUrl: course.thumbnail_url, subject: course.subject,
    gradeLevel: course.grade_level, difficulty: course.difficulty,
    status: course.status, estimatedMinutes: course.estimated_minutes,
    createdAt: course.created_at, category: null, tags: [],
    teacher: { id: course.teacher_id, fullName: course.full_name, avatarUrl: course.avatar_url },
    _count: { modules: modules.length, enrollments: enrollments.length },
  };
}

function courseRows() {
  return db.selectFrom("courses")
    .innerJoin("profiles", "profiles.id", "courses.teacher_id")
    .select([
      "courses.id", "courses.title", "courses.description", "courses.thumbnail_url",
      "courses.teacher_id", "courses.subject", "courses.grade_level", "courses.difficulty",
      "courses.status", "courses.estimated_minutes", "courses.created_at",
      "profiles.full_name", "profiles.avatar_url",
    ])
    .where("courses.deleted_at", "is", null).execute();
}

export function registerLearningRoutes(app: FastifyInstance) {
  app.get("/api/courses", async (request) => {
    const query = z.object({ status: z.string().optional(), teacherId: z.string().optional(), search: z.string().optional() })
      .parse(request.query);
    const user = await currentUser(request.headers.cookie);
    const courses = await courseRows();
    const filtered = courses.filter((course) =>
      (course.status === "published" || (user && (user.role === "admin" || course.teacher_id === user.id))) &&
      (!query.status || course.status === query.status) &&
      (!query.teacherId || course.teacher_id === query.teacherId) &&
      (!query.search || `${course.title} ${course.description ?? ""}`.toLowerCase().includes(query.search.toLowerCase())));
    return Promise.all(filtered.map(courseView));
  });

  app.get<{ Params: { id: string } }>("/api/courses/:id", async (request, reply) => {
    const course = (await courseRows()).find((item) => item.id === request.params.id);
    if (!course) return reply.code(404).send({ error: "Course not found" });
    if (course.status !== "published") {
      const user = await currentUser(request.headers.cookie);
      if (!user || (user.role !== "admin" && course.teacher_id !== user.id)) {
        return reply.code(404).send({ error: "Course not found" });
      }
    }
    const modules = await db.selectFrom("modules").selectAll()
      .where("course_id", "=", course.id).orderBy("sort_order").execute();
    return {
      ...await courseView(course),
      modules: await Promise.all(modules.map(async (module) => ({
        id: module.id, title: module.title, description: module.description,
        sortOrder: module.sort_order,
        lessons: (await db.selectFrom("lessons").selectAll()
          .where("module_id", "=", module.id).orderBy("sort_order").execute())
          .map((lesson) => ({ id: lesson.id, title: lesson.title, sortOrder: lesson.sort_order, estimatedMinutes: lesson.estimated_minutes })),
      }))),
    };
  });

  app.post("/api/courses", async (request, reply) => {
    const user = await currentUser(request.headers.cookie);
    if (!user) return reply.code(401).send({ error: "Unauthorized" });
    if (!["teacher", "admin"].includes(user.role)) return reply.code(403).send({ error: "Forbidden" });
    const parsed = courseInput.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: "Invalid course" });
    const input = parsed.data;
    const id = randomUUID();
    await db.insertInto("courses").values({
      id, title: input.title, description: input.description ?? null, thumbnail_url: null,
      teacher_id: user.id, category_id: input.categoryId ?? null, subject: input.subject ?? null,
      grade_level: input.gradeLevel ?? null, difficulty: input.difficulty ?? "beginner",
      estimated_minutes: input.estimatedMinutes ?? null, status: "draft", deleted_at: null,
      created_at: new Date().toISOString(),
    }).execute();
    return reply.code(201).send({ id });
  });

  app.get("/api/enrollments", async (request, reply) => {
    const user = await currentUser(request.headers.cookie);
    if (!user) return reply.code(401).send({ error: "Unauthorized" });
    const enrollments = await db.selectFrom("enrollments").selectAll()
      .where("user_id", "=", user.id).execute();
    const courses = await courseRows();
    return Promise.all(enrollments.map(async (enrollment) => {
      const course = courses.find((item) => item.id === enrollment.course_id);
      return {
        id: enrollment.id, progress: enrollment.progress, archived: Boolean(enrollment.archived),
        courseId: enrollment.course_id, userId: enrollment.user_id,
        createdAt: enrollment.created_at,
        course: course ? await courseView(course) : null,
      };
    }));
  });

  app.post("/api/enrollments", async (request, reply) => {
    const user = await currentUser(request.headers.cookie);
    if (!user) return reply.code(401).send({ error: "Unauthorized" });
    const parsed = z.object({ courseId: z.string().min(1) }).safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: "Invalid course" });
    const course = await db.selectFrom("courses").select(["id", "status"])
      .where("id", "=", parsed.data.courseId).where("deleted_at", "is", null).executeTakeFirst();
    if (!course || course.status !== "published") return reply.code(404).send({ error: "Course not found" });
    const existing = await db.selectFrom("enrollments").select("id")
      .where("user_id", "=", user.id).where("course_id", "=", course.id).executeTakeFirst();
    if (existing) return reply.code(409).send({ error: "Already enrolled" });
    const id = randomUUID();
    await db.insertInto("enrollments").values({
      id, user_id: user.id, course_id: course.id, progress: 0, archived: 0,
      created_at: new Date().toISOString(),
    }).execute();
    return reply.code(201).send({ id });
  });

  app.patch("/api/auth/onboarding", async (request, reply) => {
    const user = await currentUser(request.headers.cookie);
    if (!user) return reply.code(401).send({ error: "Unauthorized" });
    const parsed = z.object({ fullName: z.string().trim().min(1).optional(), ageGroup: z.string().optional() })
      .passthrough().safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: "Invalid input" });
    await db.updateTable("profiles").set({
      full_name: parsed.data.fullName ?? user.fullName,
      age_group: parsed.data.ageGroup ?? user.ageGroup,
      onboarding_completed: 1,
      metadata: JSON.stringify(parsed.data),
    }).where("id", "=", user.id).execute();
    return { success: true };
  });
}
