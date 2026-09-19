import { redirect } from "next/navigation";

import { AppLayout } from "@/components/layout/app-layout";
import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function DashboardLayout({
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
    select: { role: true, onboardingCompleted: true },
  });

  if (!profile?.onboardingCompleted) {
    redirect("/onboarding");
  }

  const role = (profile.role ?? "student") as "student" | "teacher" | "parent" | "admin";

  return <AppLayout role={role}>{children}</AppLayout>;
}
