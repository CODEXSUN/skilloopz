"use client";

import { useState, useEffect } from "react";
import { Mail, Loader2, Save, Send, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { ErrorState } from "@/components/ui/error-state";

interface EmailConfig {
  enabled: boolean;
  provider: "sendgrid" | "smtp";
  apiKey: string;
  fromEmail: string;
  fromName: string;
}

export default function AdminEmailPage() {
  const [config, setConfig] = useState<EmailConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testEmail, setTestEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  async function fetchConfig() {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/email/config");
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
      const res = await fetch("/api/admin/email/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }
      setMessage("Email configuration saved");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleTest() {
    if (!testEmail) return;
    setIsTesting(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/email/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: testEmail }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Test failed");
      }
      setMessage("Test email sent successfully");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Test failed");
    } finally {
      setIsTesting(false);
    }
  }

  if (isLoading) return <LoadingScreen fullScreen={false} message="Loading email config..." />;
  if (error) return <ErrorState message={error} onRetry={fetchConfig} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Email Service</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure SendGrid or SMTP for transactional emails.
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
                <Mail className="h-5 w-5 text-primary" />
                Provider Configuration
              </CardTitle>
              <CardDescription>
                SendGrid is recommended for production. SMTP uses local fallback.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div>
                  <p className="text-sm font-medium text-foreground">Email Enabled</p>
                  <p className="text-xs text-muted-foreground">
                    Send transactional emails (verification, password reset, welcome)
                  </p>
                </div>
                <Switch
                  checked={config.enabled}
                  onCheckedChange={(v) => setConfig({ ...config, enabled: v })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">Provider</label>
                <select
                  value={config.provider}
                  onChange={(e) => setConfig({ ...config, provider: e.target.value as "sendgrid" | "smtp" })}
                  className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="sendgrid">SendGrid</option>
                  <option value="smtp">SMTP (local/dev)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">
                  {config.provider === "sendgrid" ? "SendGrid API Key" : "SMTP Password"}
                </label>
                <Input
                  value={config.apiKey}
                  onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                  type="password"
                  placeholder={config.provider === "sendgrid" ? "SG.xxxxxxxx" : "SMTP password"}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-foreground">From Email</label>
                  <Input
                    value={config.fromEmail}
                    onChange={(e) => setConfig({ ...config, fromEmail: e.target.value })}
                    placeholder="noreply@neot.app"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-foreground">From Name</label>
                  <Input
                    value={config.fromName}
                    onChange={(e) => setConfig({ ...config, fromName: e.target.value })}
                    placeholder="NEOT"
                  />
                </div>
              </div>

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
              <CardTitle>Send Test Email</CardTitle>
              <CardDescription>
                Verify your email configuration by sending a test message.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">Recipient Email</label>
                <div className="flex gap-2">
                  <Input
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="flex-1"
                  />
                  <Button
                    onClick={handleTest}
                    disabled={isTesting || !testEmail}
                    variant="secondary"
                  >
                    {isTesting ? (
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Send className="mr-1.5 h-3.5 w-3.5" />
                    )}
                    Send Test
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {message && (
        <div className={`rounded-lg border p-3 text-center text-sm ${
          message.includes("sent") || message.includes("saved")
            ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-400"
            : "border-red-500/20 bg-red-500/5 text-red-400"
        }`}>
          {message}
        </div>
      )}
    </div>
  );
}
