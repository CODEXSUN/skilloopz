"use client";

import { useState, useEffect } from "react";
import { Plus, GraduationCap, Loader2, Trash2, RefreshCw, Check, X, Copy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { ErrorState } from "@/components/ui/error-state";

interface LtiRegistration {
  id: string;
  name: string;
  issuer: string;
  clientId: string;
  deploymentId: string;
  authUrl: string;
  tokenUrl: string;
  keysetUrl: string;
  enabled: boolean;
  createdAt: string;
}

export default function AdminLtiPage() {
  const [regs, setRegs] = useState<LtiRegistration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    issuer: "",
    clientId: "",
    deploymentId: "",
    authUrl: "",
    tokenUrl: "",
    keysetUrl: "",
    enabled: true,
  });

  useEffect(() => {
    fetchRegs();
  }, []);

  async function fetchRegs() {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/lti");
      if (!res.ok) throw new Error("Failed to load LTI registrations");
      const data = await res.json();
      setRegs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setIsLoading(false);
    }
  }

  function resetForm() {
    setForm({ name: "", issuer: "", clientId: "", deploymentId: "", authUrl: "", tokenUrl: "", keysetUrl: "", enabled: true });
    setEditingId(null);
    setShowForm(false);
  }

  function startEdit(reg: LtiRegistration) {
    setForm({
      name: reg.name,
      issuer: reg.issuer,
      clientId: reg.clientId,
      deploymentId: reg.deploymentId,
      authUrl: reg.authUrl,
      tokenUrl: reg.tokenUrl,
      keysetUrl: reg.keysetUrl,
      enabled: reg.enabled,
    });
    setEditingId(reg.id);
    setShowForm(true);
  }

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    try {
      const url = editingId ? `/api/admin/lti/${editingId}` : "/api/admin/lti";
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
      setMessage(editingId ? "Registration updated" : "Registration created");
      resetForm();
      await fetchRegs();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this LTI registration?")) return;
    try {
      const res = await fetch(`/api/admin/lti/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      await fetchRegs();
      setMessage("Registration deleted");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to delete");
    }
  }

  async function handleToggle(id: string, enabled: boolean) {
    try {
      await fetch(`/api/admin/lti/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled }),
      });
      await fetchRegs();
    } catch {
      // ignore
    }
  }

  function copyToClipboard(text: string, field: string) {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  }

  if (isLoading) return <LoadingScreen fullScreen={false} message="Loading LTI registrations..." />;
  if (error) return <ErrorState message={error} onRetry={fetchRegs} />;

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">LTI Integration</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage LTI 1.3 registrations for Canvas, Moodle, Blackboard, and other LMS platforms.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchRegs}>
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
            Refresh
          </Button>
          <Button size="sm" onClick={() => { resetForm(); setShowForm(true); }}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Add Registration
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            NEOT LTI Tool URLs
          </CardTitle>
          <CardDescription>
            Use these URLs when configuring NEOT as an external tool in your LMS.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { label: "OIDC Login URL", value: `${baseUrl}/api/lti/oidc` },
            { label: "LTI Launch URL", value: `${baseUrl}/api/lti/launch` },
            { label: "JWK Keyset URL", value: `${baseUrl}/api/lti/keyset` },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <p className="text-xs font-medium text-foreground">{item.label}</p>
                <p className="text-xs font-mono text-muted-foreground">{item.value}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => copyToClipboard(item.value, item.label)}
              >
                {copiedField === item.label ? (
                  <Check className="h-4 w-4 text-emerald-400" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "Edit Registration" : "New LTI Registration"}</CardTitle>
            <CardDescription>
              Configure an LTI 1.3 connection with an external LMS platform.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">Registration Name</label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Canvas Production" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">Issuer</label>
                <Input value={form.issuer} onChange={(e) => setForm({ ...form, issuer: e.target.value })} placeholder="https://canvas.instructure.com" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">Client ID</label>
                <Input value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })} placeholder="LMS-provided client ID" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">Deployment ID</label>
                <Input value={form.deploymentId} onChange={(e) => setForm({ ...form, deploymentId: e.target.value })} placeholder="LMS-provided deployment ID" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground">Authorization URL</label>
              <Input value={form.authUrl} onChange={(e) => setForm({ ...form, authUrl: e.target.value })} placeholder="https://lms.example.com/api/lti/authorize" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">Token URL</label>
                <Input value={form.tokenUrl} onChange={(e) => setForm({ ...form, tokenUrl: e.target.value })} placeholder="https://lms.example.com/login/oauth2/token" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">Keyset URL</label>
                <Input value={form.keysetUrl} onChange={(e) => setForm({ ...form, keysetUrl: e.target.value })} placeholder="https://lms.example.com/api/lti/security/jwks" />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div>
                <p className="text-sm font-medium text-foreground">Enabled</p>
                <p className="text-xs text-muted-foreground">Allow LTI launches from this platform</p>
              </div>
              <Switch checked={form.enabled} onCheckedChange={(v) => setForm({ ...form, enabled: v })} />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={saving || !form.name || !form.issuer || !form.clientId}>
                {saving ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Check className="mr-1.5 h-3.5 w-3.5" />}
                {editingId ? "Update Registration" : "Create Registration"}
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
          message.includes("Failed") ? "border-red-500/20 bg-red-500/5 text-red-400" : "border-emerald-500/20 bg-emerald-500/5 text-emerald-400"
        }`}>
          {message}
        </div>
      )}

      <div className="space-y-3">
        {regs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <GraduationCap className="mb-4 h-12 w-12 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No LTI registrations configured yet.</p>
              <p className="text-xs text-muted-foreground">Add your first registration to enable LMS integration.</p>
            </CardContent>
          </Card>
        ) : (
          regs.map((reg) => (
            <Card key={reg.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border bg-muted text-sm font-bold text-muted-foreground">
                    {reg.name[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{reg.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{reg.issuer}</span>
                      <span>·</span>
                      <span className={reg.enabled ? "text-emerald-400" : "text-red-400"}>
                        {reg.enabled ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={reg.enabled} onCheckedChange={(v) => handleToggle(reg.id, v)} />
                  <Button variant="ghost" size="icon" onClick={() => startEdit(reg)}>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(reg.id)}>
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
