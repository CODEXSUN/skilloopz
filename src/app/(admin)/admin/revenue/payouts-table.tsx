"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Payout = {
  id: string;
  teacherId: string;
  amount: number;
  currency: string;
  status: string;
  method: string;
  description: string | null;
  createdAt: string;
};

export function PayoutsTable({ payouts: initial }: { payouts: Payout[] }) {
  const router = useRouter();
  const [payouts, setPayouts] = useState(initial);
  const [processing, setProcessing] = useState<string | null>(null);

  async function handleAction(id: string, action: "approve" | "reject") {
    setProcessing(id);
    try {
      await fetch(`/api/admin/revenue/payouts`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payoutId: id, action }),
      });
      setPayouts((prev) => prev.filter((p) => p.id !== id));
      router.refresh();
    } finally {
      setProcessing(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Pending Payouts</CardTitle>
      </CardHeader>
      <CardContent>
        {payouts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No pending payouts.</p>
        ) : (
          <div className="space-y-3">
            {payouts.map((payout) => (
              <div key={payout.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                <div>
                  <p className="text-sm font-medium">{payout.description ?? "Payout"}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(payout.createdAt).toLocaleDateString()} &middot; {payout.method}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold">${payout.amount.toFixed(2)}</span>
                  <Badge variant="outline" className="text-yellow-500 border-yellow-500/30">
                    {payout.status}
                  </Badge>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-green-500 border-green-500/30"
                      onClick={() => handleAction(payout.id, "approve")}
                      disabled={processing === payout.id}
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-500 border-red-500/30"
                      onClick={() => handleAction(payout.id, "reject")}
                      disabled={processing === payout.id}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
