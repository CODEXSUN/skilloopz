import Link from "next/link";
import { FileText, Calendar, DollarSign, Users } from "lucide-react";

import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SchoolPlanSelector } from "@/components/school/school-plan-selector";

export default async function SchoolContractsPage() {
  const user = await getUser();
  if (!user || !user.schoolId) return null;

  const contracts = await prisma.schoolContract.findMany({
    where: { schoolId: user.schoolId },
    orderBy: { createdAt: "desc" },
  });

  const activeContract = contracts.find((c) => c.status === "active");

  const tierLabels: Record<string, string> = {
    free: "Free",
    pro: "Pro",
    school: "School",
    enterprise: "Enterprise",
  };

  const statusColors: Record<string, string> = {
    active: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    expired: "bg-red-500/20 text-red-400 border-red-500/30",
    cancelled: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
            Contracts
          </h1>
          <p className="mt-1 text-muted-foreground">
            Manage your school subscription and contracts.
          </p>
        </div>
      </div>

      {activeContract && (
        <Card className="border-primary-500/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Active Contract</CardTitle>
                <CardDescription>Your current subscription details.</CardDescription>
              </div>
              <Badge className={statusColors[activeContract.status] ?? "bg-muted text-muted-foreground"}>
                {activeContract.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg bg-[rgba(255,255,255,0.03)] p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Start Date</span>
                </div>
                <p className="mt-1 font-heading text-lg font-bold text-foreground">
                  {new Date(activeContract.startDate).toLocaleDateString()}
                </p>
              </div>
              <div className="rounded-lg bg-[rgba(255,255,255,0.03)] p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>End Date</span>
                </div>
                <p className="mt-1 font-heading text-lg font-bold text-foreground">
                  {new Date(activeContract.endDate).toLocaleDateString()}
                </p>
              </div>
              <div className="rounded-lg bg-[rgba(255,255,255,0.03)] p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  <span>Monthly Price</span>
                </div>
                <p className="mt-1 font-heading text-lg font-bold text-foreground">
                  {activeContract.pricePerMonth > 0
                    ? `${activeContract.currency} ${activeContract.pricePerMonth.toFixed(2)}`
                    : "Free"}
                </p>
              </div>
              <div className="rounded-lg bg-[rgba(255,255,255,0.03)] p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>Capacity</span>
                </div>
                <p className="mt-1 font-heading text-lg font-bold text-foreground">
                  {activeContract.maxStudents} students
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Contract History</CardTitle>
          <CardDescription>All contracts for your school.</CardDescription>
        </CardHeader>
        <CardContent>
          {contracts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground/40" />
              <p className="mt-4 text-muted-foreground">No contracts yet.</p>
              <p className="mt-1 text-sm text-muted-foreground/60">
                Contracts are created when you subscribe to a plan.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {contracts.map((contract) => (
                <div
                  key={contract.id}
                  className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/5 px-4 py-3"
                >
                  <div className="flex items-center gap-4">
                    <FileText className="h-5 w-5 text-muted-foreground/60" />
                    <div>
                      <p className="font-medium text-foreground">
                        {tierLabels[contract.type] ?? contract.type} Plan
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(contract.startDate).toLocaleDateString()} - {new Date(contract.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-sm font-medium text-foreground">
                      {contract.pricePerMonth > 0
                        ? `${contract.currency} ${contract.pricePerMonth.toFixed(2)}/mo`
                        : "Free"}
                    </p>
                    <Badge className={statusColors[contract.status] ?? "bg-muted text-muted-foreground"}>
                      {contract.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Available Plans</CardTitle>
          <CardDescription>Upgrade or change your subscription.</CardDescription>
        </CardHeader>
        <CardContent>
          <SchoolPlanSelector
            plans={[
              { id: "free", name: "Free", price: 0, students: 50, teachers: 5, features: ["Basic courses", "Limited storage"] },
              { id: "pro", name: "Pro", price: 29.99, students: 200, teachers: 20, features: ["Full features", "Analytics", "AI tutor"] },
              { id: "school", name: "School", price: 99.99, students: 1000, teachers: 100, features: ["White-label", "Bulk users", "Priority support"] },
              { id: "enterprise", name: "Enterprise", price: 299.99, students: 10000, teachers: 500, features: ["Unlimited", "API access", "SLA", "Dedicated support"] },
            ]}
            currentPlan={activeContract?.type ?? "free"}
            onSuccess={() => window.location.reload()}
          />
        </CardContent>
      </Card>
    </div>
  );
}
