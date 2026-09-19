"use client";

import { useState, useEffect } from "react";
import { Globe, Loader2, Save, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { ErrorState } from "@/components/ui/error-state";

interface CdnConfig {
  enabled: boolean;
  url: string;
  mediaPrefix: string;
  staticAssetsPrefix: string;
}

export default function AdminCdnPage() {
  const [config, setConfig] = useState<CdnConfig | null>(null);
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
      const res = await fetch("/api/admin/cdn");
      if (!res.ok) throw new Error("Failed to load CDN config");
      const data = await res.json();
      setConfig(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load CDN config");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSave() {
    if (!config) return;
    setIsSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/cdn", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to save");
      }
      setMessage("CDN configuration saved");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) return <LoadingScreen fullScreen={false} message="Loading CDN configuration..." />;
  if (error) return <ErrorState message={error} onRetry={fetchConfig} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">CDN Integration</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure Content Delivery Network for media and static assets.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchConfig}>
          <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
          Refresh
        </Button>
      </div>

      {config && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                CDN Configuration
              </CardTitle>
              <CardDescription>
                When enabled, media and asset URLs will be prefixed with your CDN URL.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div>
                  <p className="text-sm font-medium text-foreground">CDN Enabled</p>
                  <p className="text-xs text-muted-foreground">
                    Serve media and assets through CDN
                  </p>
                </div>
                <Switch
                  checked={config.enabled}
                  onCheckedChange={(v) => setConfig({ ...config, enabled: v })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">CDN URL</label>
                <Input
                  value={config.url}
                  onChange={(e) => setConfig({ ...config, url: e.target.value })}
                  placeholder="https://cdn.neot.com"
                />
                <p className="text-[10px] text-muted-foreground">
                  The base URL of your CDN (e.g., https://cdn.neot.com)
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-foreground">Media Prefix</label>
                  <Input
                    value={config.mediaPrefix}
                    onChange={(e) => setConfig({ ...config, mediaPrefix: e.target.value })}
                    placeholder="/media"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Path prefix for uploaded media
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-foreground">Static Assets Prefix</label>
                  <Input
                    value={config.staticAssetsPrefix}
                    onChange={(e) => setConfig({ ...config, staticAssetsPrefix: e.target.value })}
                    placeholder="/assets"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Path prefix for static assets
                  </p>
                </div>
              </div>

              {config.enabled && config.url && (
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
                  <p className="text-xs text-emerald-400">
                    CDN is active. Media URLs will be transformed to:{" "}
                    <code className="rounded bg-emerald-500/10 px-1 py-0.5 font-mono">
                      {config.url}{config.mediaPrefix}/filename.ext
                    </code>
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

          <Card>
            <CardHeader>
              <CardTitle className="text-base">How CDN Integration Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                When CDN is enabled, the platform automatically prefixes media and asset URLs
                with your CDN URL. This works for:
              </p>
              <ul className="list-disc space-y-1 pl-5">
                <li>Uploaded media files (images, videos, documents)</li>
                <li>Course content with media references</li>
                <li>Static assets served through the platform</li>
              </ul>
              <p className="text-xs text-muted-foreground">
                Note: You must configure your CDN to serve content from your origin server
                (or upload assets to the CDN directly). The CDN URL should point to your
                CDN distribution endpoint.
              </p>
            </CardContent>
          </Card>
        </>
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
