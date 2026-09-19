import { redirect } from "next/navigation";

import { AppLayout } from "@/components/layout/app-layout";
import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
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

  if (!profile || profile.role !== "admin") {
    redirect("/dashboard");
  }

  return <AppLayout role="admin">{children}</AppLayout>;
}
