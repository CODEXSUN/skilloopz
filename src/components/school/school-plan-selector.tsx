"use client";

import { useState } from "react";
import { Check, Loader2, AlertTriangle, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Plan {
  id: string;
  name: string;
  price: number;
  students: number;
  teachers: number;
  features: string[];
}

interface SchoolPlanSelectorProps {
  plans: Plan[];
  currentPlan: string;
  onSuccess: () => void;
}

export function SchoolPlanSelector({ plans, currentPlan, onSuccess }: SchoolPlanSelectorProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmPlan, setConfirmPlan] = useState<Plan | null>(null);

  const handleSelectPlan = async (planId: string) => {
    setLoading(planId);
    setError(null);
    setSuccess(null);
    setConfirmPlan(null);

    try {
      const res = await fetch("/api/school/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to update plan");
        return;
      }

      setSuccess(planId);
      onSuccess();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  const currentPlanData = plans.find((p) => p.id === currentPlan);
  const selectedPlan = confirmPlan;
  const isUpgrade = selectedPlan && selectedPlan.price > (currentPlanData?.price ?? 0);
  const isDowngrade = selectedPlan && selectedPlan.price < (currentPlanData?.price ?? 0);

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
          Plan updated successfully!
        </div>
      )}

      {confirmPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-2xl border border-border/50 bg-card p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/20">
                  <AlertTriangle className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-bold text-foreground">Confirm Plan Change</h3>
                  <p className="text-sm text-muted-foreground">
                    Switch from {currentPlanData?.name} to {confirmPlan.name}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setConfirmPlan(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="mt-4 rounded-lg border border-border/50 bg-muted/10 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Current</p>
                  <p className="font-medium text-foreground">{currentPlanData?.name}</p>
                </div>
                <div className="text-muted-foreground">→</div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">New</p>
                  <p className="font-medium text-foreground">{confirmPlan.name}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-3">
                <div>
                  <p className="text-sm text-muted-foreground">Price</p>
                  <p className="font-medium text-foreground">
                    {currentPlanData?.price === 0 ? "Free" : `$${currentPlanData?.price.toFixed(2)}/mo`}
                  </p>
                </div>
                <div className="text-muted-foreground">→</div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Price</p>
                  <p className="font-medium text-foreground">
                    {confirmPlan.price === 0 ? "Free" : `$${confirmPlan.price.toFixed(2)}/mo`}
                  </p>
                </div>
              </div>
            </div>

            {isUpgrade && (
              <p className="mt-3 text-sm text-emerald-400">
                Upgrade: Your school will gain access to additional features immediately.
              </p>
            )}
            {isDowngrade && (
              <p className="mt-3 text-sm text-amber-400">
                Downgrade: Some features may become unavailable after the change.
              </p>
            )}

            <div className="mt-4 flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setConfirmPlan(null)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={() => handleSelectPlan(confirmPlan.id)}
              >
                Confirm Change
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan) => {
          const isCurrent = currentPlan === plan.id;
          const isLoading = loading === plan.id;
          const isSuccess = success === plan.id;

          return (
            <div
              key={plan.id}
              className={`rounded-xl border p-4 transition-all ${
                isCurrent
                  ? "border-primary-500/30 bg-primary-500/10"
                  : "border-border/50 bg-muted/5"
              }`}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-heading text-lg font-bold text-foreground">{plan.name}</h3>
                {isCurrent && <Badge className="bg-emerald-500/20 text-emerald-400">Current</Badge>}
              </div>
              <p className="mt-1 text-2xl font-bold text-foreground">
                {plan.price === 0 ? "Free" : `$${plan.price.toFixed(2)}`}
                {plan.price > 0 && <span className="text-sm font-normal text-muted-foreground">/mo</span>}
              </p>
              <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
                <li>{plan.students === -1 ? "Unlimited" : `${plan.students}`} students</li>
                <li>{plan.teachers === -1 ? "Unlimited" : `${plan.teachers}`} teachers</li>
                {plan.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              {!isCurrent && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 w-full"
                  onClick={() => setConfirmPlan(plan)}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : isSuccess ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Updated
                    </>
                  ) : (
                    "Select Plan"
                  )}
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
