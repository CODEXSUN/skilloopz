import { redirect } from "next/navigation";

import { AppLayout } from "@/components/layout/app-layout";
import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
    select: { role: true },
  });

  if (!profile || profile.role !== "teacher") {
    redirect("/dashboard");
  }

  return <AppLayout role="teacher">{children}</AppLayout>;
}
