import { DollarSign, TrendingUp, Users, Clock } from "lucide-react";

import { getUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RevenueConfigForm } from "./revenue-config-form";
import { PayoutsTable } from "./payouts-table";

export default async function AdminRevenuePage() {
  const userId = await getUserId();
  if (!userId) {
    return <div>Please log in.</div>;
  }

  const user = await prisma.profile.findUnique({ where: { id: userId } });
  if (!user || user.role !== "admin") {
    return <div>Access denied.</div>;
  }

  const config = await prisma.revenueShareConfig.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });

  const totals = await prisma.marketplacePurchase.aggregate({
    _sum: { price: true, platformFee: true, teacherCut: true },
    _count: { id: true },
  });

  const teacherCount = await prisma.marketplacePurchase.groupBy({
    by: ["teacherId"],
    _count: { id: true },
  });

  const rawPayouts = await prisma.payoutTransaction.findMany({
    where: { status: "pending" },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  const pendingPayouts = rawPayouts.map((p) => ({ ...p, createdAt: p.createdAt.toISOString() }));

  const topTeachers = await prisma.marketplacePurchase.groupBy({
    by: ["teacherId"],
    _sum: { teacherCut: true },
    _count: { id: true },
    orderBy: { _sum: { teacherCut: "desc" } },
    take: 10,
  });

  const teacherNames = topTeachers.length > 0
    ? await prisma.profile.findMany({
        where: { id: { in: topTeachers.map((t) => t.teacherId) } },
        select: { id: true, fullName: true },
      })
    : [];

  const nameMap = new Map(teacherNames.map((n) => [n.id, n.fullName]));

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6">
      <div>
        <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">Revenue Management</h1>
        <p className="mt-1 text-muted-foreground">Platform earnings, teacher payouts, and revenue sharing configuration.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totals._sum.price?.toFixed(2) ?? "0.00"}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Platform Fees</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">
              ${totals._sum.platformFee?.toFixed(2) ?? "0.00"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Teachers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teacherCount.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Payouts</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{pendingPayouts.length}</div>
            <p className="text-xs text-muted-foreground">
              ${pendingPayouts.reduce((s, p) => s + p.amount, 0).toFixed(2)} total
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <RevenueConfigForm config={config} />

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Teachers</CardTitle>
          </CardHeader>
          <CardContent>
            {topTeachers.length === 0 ? (
              <p className="text-sm text-muted-foreground">No sales yet.</p>
            ) : (
              <div className="space-y-3">
                {topTeachers.map((t, i) => (
                  <div key={t.teacherId} className="flex items-center justify-between border-b pb-2 last:border-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">#{i + 1}</span>
                      <p className="text-sm font-medium">{nameMap.get(t.teacherId) ?? "Unknown"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">${(t._sum.teacherCut ?? 0).toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">{t._count.id} sales</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <PayoutsTable payouts={pendingPayouts} />
    </div>
  );
}
