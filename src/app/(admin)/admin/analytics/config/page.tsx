"use client";

import { useState, useEffect } from "react";
import { BarChart3, Loader2, Save, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { ErrorState } from "@/components/ui/error-state";

interface AnalyticsConfig {
  enabled: boolean;
  ga4Id: string;
  mixpanelToken: string;
}

export default function AdminAnalyticsConfigPage() {
  const [config, setConfig] = useState<AnalyticsConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  async function fetchConfig() {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/analytics/config");
      if (!res.ok) throw new Error("Failed to load config");
      const data = await res.json();
      setConfig(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load config");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSave() {
    if (!config) return;
    setIsSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/analytics/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (!res.ok) throw new Error("Failed to save");
      setMessage("Analytics configuration saved");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) return <LoadingScreen fullScreen={false} message="Loading analytics config..." />;
  if (error) return <ErrorState message={error} onRetry={fetchConfig} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure Google Analytics and Mixpanel tracking.
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
              <BarChart3 className="h-5 w-5 text-primary" />
              Analytics Configuration
            </CardTitle>
            <CardDescription>
              Tracking scripts will be injected on all pages when enabled.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div>
                <p className="text-sm font-medium text-foreground">Analytics Enabled</p>
                <p className="text-xs text-muted-foreground">
                  Enable tracking scripts on all pages
                </p>
              </div>
              <Switch
                checked={config.enabled}
                onCheckedChange={(v) => setConfig({ ...config, enabled: v })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground">Google Analytics 4 ID</label>
              <Input
                value={config.ga4Id}
                onChange={(e) => setConfig({ ...config, ga4Id: e.target.value })}
                placeholder="G-XXXXXXXXXX"
              />
              <p className="text-[10px] text-muted-foreground">
                Your GA4 measurement ID from your Google Analytics property.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground">Mixpanel Token</label>
              <Input
                value={config.mixpanelToken}
                onChange={(e) => setConfig({ ...config, mixpanelToken: e.target.value })}
                placeholder="Your Mixpanel project token"
              />
              <p className="text-[10px] text-muted-foreground">
                Your Mixpanel project token for event tracking.
              </p>
            </div>

            {config.enabled && (config.ga4Id || config.mixpanelToken) && (
              <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
                <p className="text-xs text-emerald-400">
                  Analytics scripts will be loaded on all pages.
                  {config.ga4Id && ` GA4: ${config.ga4Id}`}
                  {config.mixpanelToken && ` Mixpanel: ${config.mixpanelToken.slice(0, 8)}...`}
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
