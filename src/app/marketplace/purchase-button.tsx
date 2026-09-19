"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Loader2, CheckCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

export function PurchaseButton({ listingId, price, purchased }: { listingId: string; price: number; purchased?: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(purchased);

  async function handlePurchase() {
    if (done) return;
    setLoading(true);
    try {
      const res = await fetch("/api/marketplace/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error ?? "Purchase failed");
        return;
      }

      setDone(true);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button size="sm" className="gap-2" onClick={handlePurchase} disabled={loading || done}>
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : done ? (
        <CheckCircle className="h-4 w-4" />
      ) : (
        <ShoppingCart className="h-4 w-4" />
      )}
      {done ? "Enrolled" : price === 0 ? "Enroll" : "Purchase"}
    </Button>
  );
}
