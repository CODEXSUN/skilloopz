import { DollarSign, TrendingUp, CreditCard, Download } from "lucide-react";

import { getUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EarningsChart } from "./earnings-chart";
import { PayoutSettings } from "./payout-settings";

export default async function TeacherEarningsPage() {
  const userId = await getUserId();
  if (!userId) {
    return <div>Please log in.</div>;
  }

  const aggregation = await prisma.marketplacePurchase.aggregate({
    where: { teacherId: userId },
    _sum: { teacherCut: true, platformFee: true, price: true },
    _count: { id: true },
  });

  const recentPurchases = await prisma.marketplacePurchase.findMany({
    where: { teacherId: userId },
    orderBy: { createdAt: "desc" },
    take: 10,
    include: {
      listing: { select: { title: true } },
    },
  });

  const config = await prisma.revenueShareConfig.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });

  const payoutAccount = await prisma.payoutAccount.findFirst({
    where: { teacherId: userId },
  });

  const totalEarnings = aggregation._sum.teacherCut ?? 0;
  const totalSales = aggregation._count.id ?? 0;
  const platformFeePct = config?.platformFee ?? 20;

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6">
      <div>
        <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">Earnings</h1>
        <p className="mt-1 text-muted-foreground">Track your marketplace revenue and payouts.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${aggregation._sum.price?.toFixed(2) ?? "0.00"}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Your Earnings</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">${totalEarnings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">After {platformFeePct}% platform fee</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Sales</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSales}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Payout Account</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {payoutAccount ? payoutAccount.method : "Not set"}
            </div>
            <p className="text-xs text-muted-foreground">
              {payoutAccount ? payoutAccount.accountEmail ?? payoutAccount.bankAccount ?? "—" : "Configure payouts"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Sales</CardTitle>
            </CardHeader>
            <CardContent>
              {recentPurchases.length === 0 ? (
                <p className="text-sm text-muted-foreground">No sales yet.</p>
              ) : (
                <div className="space-y-3">
                  {recentPurchases.map((p) => (
                    <div key={p.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                      <div>
                        <p className="text-sm font-medium">{p.listing.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(p.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-green-500">+${p.teacherCut.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">${p.price.toFixed(2)} - ${p.platformFee.toFixed(2)} fee</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <PayoutSettings account={payoutAccount} config={config} />
        </div>
      </div>
    </div>
  );
}
