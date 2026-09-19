"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Config = {
  id: string;
  platformFee: number;
  minPayout: number;
  payoutMethod: string;
} | null;

export function RevenueConfigForm({ config }: { config: Config }) {
  const router = useRouter();
  const [platformFee, setPlatformFee] = useState(String(config?.platformFee ?? 20));
  const [minPayout, setMinPayout] = useState(String(config?.minPayout ?? 50));
  const [payoutMethod, setPayoutMethod] = useState(config?.payoutMethod ?? "manual");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await fetch("/api/admin/revenue", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platformFee: parseFloat(platformFee),
          minPayout: parseFloat(minPayout),
          payoutMethod,
        }),
      });
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Revenue Share Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Platform Fee (%)</Label>
          <Input
            type="number"
            min="0"
            max="100"
            step="0.5"
            value={platformFee}
            onChange={(e) => setPlatformFee(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Percentage taken from each sale. Teacher receives the remainder.
          </p>
        </div>

        <div className="space-y-2">
          <Label>Minimum Payout ($)</Label>
          <Input
            type="number"
            min="0"
            step="5"
            value={minPayout}
            onChange={(e) => setMinPayout(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Minimum balance before a teacher can request a payout.
          </p>
        </div>

        <div className="space-y-2">
          <Label>Default Payout Method</Label>
          <Select value={payoutMethod} onValueChange={setPayoutMethod}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="manual">Manual</SelectItem>
              <SelectItem value="auto">Automatic</SelectItem>
              <SelectItem value="stripe">Stripe Connect</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full gap-2">
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save Configuration"}
        </Button>
      </CardContent>
    </Card>
  );
}
