import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ParentReportsContent } from "@/components/parent/parent-reports-content";

export default async function ParentReportsPage() {
  const user = await getUser();
  if (!user) redirect("/login");

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
    select: { role: true },
  });

  if (profile?.role !== "parent") redirect("/dashboard");

  const children = await prisma.profile.findMany({
    where: { parentId: user.id },
    select: { id: true, fullName: true, email: true },
  });

  return <ParentReportsContent childItems={children} />;
}
