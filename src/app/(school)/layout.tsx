import { redirect } from "next/navigation";

import { AppLayout } from "@/components/layout/app-layout";
import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function SchoolLayout({
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
    select: { role: true, schoolId: true },
  });

  if (!profile || (profile.role !== "school_admin" && profile.role !== "school_staff")) {
    redirect("/dashboard");
  }

  if (!profile.schoolId) {
    redirect("/dashboard");
  }

  return <AppLayout role="school">{children}</AppLayout>;
}
