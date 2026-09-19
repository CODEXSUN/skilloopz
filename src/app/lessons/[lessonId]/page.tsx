import { redirect } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { getUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { LessonPlayer } from "@/components/player/player-shell";
import { buildPageMetadata, getGlobalSeoSettings } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}): Promise<Metadata> {
  const { lessonId } = await params;
  const global = await getGlobalSeoSettings();

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      module: {
        include: {
          course: { select: { title: true } },
        },
      },
    },
  }).catch(() => null);

  if (!lesson) return {};

  const title = `${lesson.title} — ${lesson.module.course.title}`;
  const description = lesson.description || global.metaDescription;

  return buildPageMetadata(undefined, { title, description }, global);
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const { lessonId } = await params;

  const userId = await getUserId();

  if (!userId) redirect("/login");

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      module: {
        include: {
          course: { select: { id: true, title: true } },
        },
      },
    },
  });

  if (!lesson) redirect("/courses");

  const content = (() => {
    try {
      const parsed = JSON.parse(lesson.content);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  })();

  const allLessons = await prisma.lesson.findMany({
    where: { moduleId: lesson.moduleId },
    orderBy: { sortOrder: "asc" },
    select: { id: true, title: true, sortOrder: true },
  });

  const currentIndex = allLessons.findIndex((l) => l.id === lessonId);

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex items-center gap-4 border-b px-6 py-3">
        <Link
          href={`/courses/${lesson.module.courseId}`}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {lesson.module.course.title}
        </Link>
        <span className="text-sm text-tertiary-foreground">/</span>
        <span className="text-sm text-foreground">{lesson.title}</span>
      </div>

      <LessonPlayer
        lesson={lesson}
        blocks={content}
        allLessons={allLessons}
        currentLessonIndex={currentIndex}
        userId={userId}
      />
    </div>
  );
}
