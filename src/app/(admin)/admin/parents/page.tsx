import { prisma } from "@/lib/db";
import { AdminParentsClient } from "@/components/admin/parents/parents-client";

interface ParentRecord {
  id: string;
  email: string | null;
  fullName: string | null;
  avatarUrl: string | null;
  createdAt: string;
  childrenCount: number;
  childrenNames: string[];
}

export default async function AdminParentsPage() {
  const parents = await prisma.profile.findMany({
    where: { role: "parent" },
    include: {
      _count: { select: { children: true } },
      children: { select: { fullName: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const mapped: ParentRecord[] = parents.map((p) => ({
    id: p.id,
    email: p.email,
    fullName: p.fullName,
    avatarUrl: p.avatarUrl,
    createdAt: p.createdAt.toISOString(),
    childrenCount: p._count.children,
    childrenNames: p.children.map((c) => c.fullName).filter((n): n is string => n !== null),
  }));

  return <AdminParentsClient parents={mapped} />;
}
