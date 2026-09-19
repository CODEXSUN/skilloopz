"use client";

import { useState, useEffect } from "react";
import { Plus, Shield, Loader2, Trash2, RefreshCw, Eye, EyeOff, Check, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { ErrorState } from "@/components/ui/error-state";

interface SsoProvider {
  id: string;
  name: string;
  providerType: string;
  clientId: string;
  clientSecret: string;
  issuerUrl: string | null;
  enabled: boolean;
  buttonLabel: string | null;
  iconUrl: string | null;
  createdAt: string;
}

const PROVIDER_TYPES = [
  { value: "google", label: "Google" },
  { value: "microsoft", label: "Microsoft" },
  { value: "github", label: "GitHub" },
  { value: "saml", label: "SAML 2.0" },
];

const PROVIDER_COLORS: Record<string, string> = {
  google: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  microsoft: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  github: "bg-neutral-500/10 text-neutral-400 border-neutral-500/20",
  saml: "bg-amber-500/10 text-amber-400 border-amber-500/20",
};

export default function AdminSsoPage() {
  const [providers, setProviders] = useState<SsoProvider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [secretVisible, setSecretVisible] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    providerType: "google",
    clientId: "",
    clientSecret: "",
    issuerUrl: "",
    enabled: true,
    buttonLabel: "",
  });

  useEffect(() => {
    fetchProviders();
  }, []);

  async function fetchProviders() {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/sso");
      if (!res.ok) throw new Error("Failed to load SSO providers");
      const data = await res.json();
      setProviders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setIsLoading(false);
    }
  }

  function resetForm() {
    setForm({ name: "", providerType: "google", clientId: "", clientSecret: "", issuerUrl: "", enabled: true, buttonLabel: "" });
    setEditingId(null);
    setShowForm(false);
  }

  function startEdit(provider: SsoProvider) {
    setForm({
      name: provider.name,
      providerType: provider.providerType,
      clientId: provider.clientId,
      clientSecret: provider.clientSecret,
      issuerUrl: provider.issuerUrl || "",
      enabled: provider.enabled,
      buttonLabel: provider.buttonLabel || "",
    });
    setEditingId(provider.id);
    setShowForm(true);
  }

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    try {
      const url = editingId ? `/api/admin/sso/${editingId}` : "/api/admin/sso";
      const method = editingId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }
      setMessage(editingId ? "Provider updated" : "Provider created");
      resetForm();
      await fetchProviders();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this SSO provider? User links will also be removed.")) return;
    try {
      const res = await fetch(`/api/admin/sso/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      await fetchProviders();
      setMessage("Provider deleted");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to delete");
    }
  }

  async function handleToggle(id: string, enabled: boolean) {
    try {
      await fetch(`/api/admin/sso/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled }),
      });
      await fetchProviders();
    } catch {
      // ignore
    }
  }

  if (isLoading) return <LoadingScreen fullScreen={false} message="Loading SSO providers..." />;
  if (error) return <ErrorState message={error} onRetry={fetchProviders} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">SSO / SAML</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage single sign-on providers for OAuth2 and SAML authentication.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchProviders}>
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
            Refresh
          </Button>
          <Button size="sm" onClick={() => { resetForm(); setShowForm(true); }}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Add Provider
          </Button>
        </div>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              {editingId ? "Edit Provider" : "New SSO Provider"}
            </CardTitle>
            <CardDescription>
              Configure an OAuth2 or SAML identity provider for single sign-on.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">Provider Name</label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. NEOT Google Workspace" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">Provider Type</label>
                <select
                  value={form.providerType}
                  onChange={(e) => setForm({ ...form, providerType: e.target.value })}
                  className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {PROVIDER_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground">Client ID</label>
              <Input value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })} placeholder="OAuth2 client ID" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground">Client Secret</label>
              <Input value={form.clientSecret} onChange={(e) => setForm({ ...form, clientSecret: e.target.value })} type="password" placeholder="OAuth2 client secret" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground">
                Issuer URL <span className="text-muted-foreground">(optional, for custom/SAML providers)</span>
              </label>
              <Input value={form.issuerUrl} onChange={(e) => setForm({ ...form, issuerUrl: e.target.value })} placeholder="https://your-idp.example.com" />
              {form.providerType === "google" && (
                <p className="text-[10px] text-muted-foreground">Leave empty for Google&#39;s default OAuth2 endpoints.</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">Button Label <span className="text-muted-foreground">(optional)</span></label>
                <Input value={form.buttonLabel} onChange={(e) => setForm({ ...form, buttonLabel: e.target.value })} placeholder="e.g. Sign in with Google" />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div>
                  <p className="text-sm font-medium text-foreground">Enabled</p>
                  <p className="text-xs text-muted-foreground">Show on login page</p>
                </div>
                <Switch checked={form.enabled} onCheckedChange={(v) => setForm({ ...form, enabled: v })} />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={saving || !form.name || !form.clientId || !form.clientSecret}>
                {saving ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Check className="mr-1.5 h-3.5 w-3.5" />}
                {editingId ? "Update Provider" : "Create Provider"}
              </Button>
              <Button variant="outline" onClick={resetForm}>
                <X className="mr-1.5 h-3.5 w-3.5" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {message && (
        <div className={`rounded-lg border p-3 text-center text-sm ${
          message.includes("Failed") || message.includes("Invalid")
            ? "border-red-500/20 bg-red-500/5 text-red-400"
            : "border-emerald-500/20 bg-emerald-500/5 text-emerald-400"
        }`}>
          {message}
        </div>
      )}

      <div className="space-y-3">
        {providers.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Shield className="mb-4 h-12 w-12 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No SSO providers configured yet.</p>
              <p className="text-xs text-muted-foreground">Add your first provider to enable single sign-on.</p>
            </CardContent>
          </Card>
        ) : (
          providers.map((provider) => (
            <Card key={provider.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg border text-sm font-bold ${PROVIDER_COLORS[provider.providerType] || "bg-muted text-muted-foreground"}`}>
                    {provider.providerType[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{provider.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="capitalize">{provider.providerType}</span>
                      <span>·</span>
                      <span className="font-mono">{provider.clientId.slice(0, 16)}...</span>
                      <span>·</span>
                      <span className={provider.enabled ? "text-emerald-400" : "text-red-400"}>
                        {provider.enabled ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={provider.enabled}
                    onCheckedChange={(v) => handleToggle(provider.id, v)}
                  />
                  <Button variant="ghost" size="icon" onClick={() => startEdit(provider)}>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(provider.id)}>
                    <Trash2 className="h-4 w-4 text-red-400" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
