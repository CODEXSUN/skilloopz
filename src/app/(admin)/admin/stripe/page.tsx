"use client";

import { useState, useEffect } from "react";
import { CreditCard, Loader2, Save, RefreshCw, Check, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { ErrorState } from "@/components/ui/error-state";

interface StripeConfig {
  enabled: boolean;
  secretKey: string;
  publishableKey: string;
  webhookSecret: string;
  currency: string;
}

export default function AdminStripePage() {
  const [config, setConfig] = useState<StripeConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [secretVisible, setSecretVisible] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  async function fetchConfig() {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/stripe/config");
      if (!res.ok) throw new Error("Failed to load config");
      const data = await res.json();
      setConfig(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSave() {
    if (!config) return;
    setIsSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/stripe/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }
      setMessage("Stripe configuration saved");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) return <LoadingScreen fullScreen={false} message="Loading Stripe config..." />;
  if (error) return <ErrorState message={error} onRetry={fetchConfig} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Stripe</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure Stripe for payment processing on the marketplace.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchConfig}>
          <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
          Refresh
        </Button>
      </div>

      {config && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Stripe Configuration
            </CardTitle>
            <CardDescription>
              Get your API keys from the{" "}
              <a href="https://dashboard.stripe.com/apikeys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Stripe Dashboard
              </a>
              . Use test keys for development.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div>
                <p className="text-sm font-medium text-foreground">Stripe Enabled</p>
                <p className="text-xs text-muted-foreground">
                  Enable Stripe payment processing for marketplace purchases
                </p>
              </div>
              <Switch
                checked={config.enabled}
                onCheckedChange={(v) => setConfig({ ...config, enabled: v })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground">Secret Key</label>
              <div className="flex gap-2">
                <Input
                  value={config.secretKey}
                  onChange={(e) => setConfig({ ...config, secretKey: e.target.value })}
                  type={secretVisible ? "text" : "password"}
                  placeholder="sk_test_..."
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSecretVisible(!secretVisible)}
                  type="button"
                >
                  {secretVisible ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground">Publishable Key</label>
              <Input
                value={config.publishableKey}
                onChange={(e) => setConfig({ ...config, publishableKey: e.target.value })}
                placeholder="pk_test_..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground">Webhook Secret</label>
              <Input
                value={config.webhookSecret}
                onChange={(e) => setConfig({ ...config, webhookSecret: e.target.value })}
                placeholder="whsec_..."
              />
              <p className="text-[10px] text-muted-foreground">
                Create a webhook in Stripe Dashboard pointing to{" "}
                <code className="rounded bg-muted px-1 py-0.5">{typeof window !== "undefined" ? window.location.origin : ""}/api/payments/webhook</code>
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground">Currency</label>
              <select
                value={config.currency}
                onChange={(e) => setConfig({ ...config, currency: e.target.value })}
                className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="usd">USD - US Dollar</option>
                <option value="eur">EUR - Euro</option>
                <option value="gbp">GBP - British Pound</option>
                <option value="cad">CAD - Canadian Dollar</option>
                <option value="aud">AUD - Australian Dollar</option>
                <option value="jpy">JPY - Japanese Yen</option>
              </select>
            </div>

            {config.enabled && config.secretKey && config.publishableKey && (
              <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
                <p className="text-xs text-emerald-400">
                  Stripe is configured and ready. Test mode: {config.secretKey.startsWith("sk_test_") ? "Yes" : "No (live mode)"}
                </p>
              </div>
            )}

            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="mr-1.5 h-3.5 w-3.5" />
              )}
              Save Configuration
            </Button>
          </CardContent>
        </Card>
      )}

      {message && (
        <div className={`rounded-lg border p-3 text-center text-sm ${
          message.includes("saved") ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-400" : "border-red-500/20 bg-red-500/5 text-red-400"
        }`}>
          {message}
        </div>
      )}
    </div>
  );
}
