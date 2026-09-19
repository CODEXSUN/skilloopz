"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type PayoutAccount = {
  id: string;
  method: string;
  accountName: string | null;
  accountEmail: string | null;
  bankName: string | null;
  bankAccount: string | null;
  routingNumber: string | null;
};

type Config = {
  platformFee: number;
  minPayout: number;
} | null;

export function PayoutSettings({ account, config }: { account: PayoutAccount | null; config: Config | null }) {
  const router = useRouter();
  const [method, setMethod] = useState(account?.method ?? "bank");
  const [accountName, setAccountName] = useState(account?.accountName ?? "");
  const [accountEmail, setAccountEmail] = useState(account?.accountEmail ?? "");
  const [bankName, setBankName] = useState(account?.bankName ?? "");
  const [bankAccount, setBankAccount] = useState(account?.bankAccount ?? "");
  const [routingNumber, setRoutingNumber] = useState(account?.routingNumber ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await fetch("/api/marketplace/payout-account", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method,
          accountName,
          accountEmail,
          bankName,
          bankAccount,
          routingNumber,
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
        <CardTitle className="text-lg">Payout Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Payout Method</Label>
          <Select value={method} onValueChange={setMethod}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bank">Bank Transfer</SelectItem>
              <SelectItem value="paypal">PayPal</SelectItem>
              <SelectItem value="stripe">Stripe</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {method === "paypal" || method === "stripe" ? (
          <div className="space-y-2">
            <Label>Account Email</Label>
            <Input
              value={accountEmail}
              onChange={(e) => setAccountEmail(e.target.value)}
              placeholder="email@example.com"
            />
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <Label>Account Holder Name</Label>
              <Input
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <Label>Bank Name</Label>
              <Input
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="Chase Bank"
              />
            </div>
            <div className="space-y-2">
              <Label>Account Number</Label>
              <Input
                value={bankAccount}
                onChange={(e) => setBankAccount(e.target.value)}
                placeholder="****1234"
              />
            </div>
            <div className="space-y-2">
              <Label>Routing Number</Label>
              <Input
                value={routingNumber}
                onChange={(e) => setRoutingNumber(e.target.value)}
                placeholder="021000021"
              />
            </div>
          </>
        )}

        {config && (
          <p className="text-xs text-muted-foreground">
            Minimum payout: ${config.minPayout}. Platform fee: {config.platformFee}%.
          </p>
        )}

        <Button onClick={handleSave} disabled={saving} className="w-full gap-2">
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save Payout Settings"}
        </Button>
      </CardContent>
    </Card>
  );
}
