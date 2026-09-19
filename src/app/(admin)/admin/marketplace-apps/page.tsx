"use client";

import { useState, useEffect } from "react";
import { Plus, Puzzle, Loader2, Trash2, RefreshCw, Check, X, ExternalLink, Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { ErrorState } from "@/components/ui/error-state";
import { Badge } from "@/components/ui/badge";

interface MarketplaceApp {
  id: string;
  name: string;
  description: string;
  developer: string;
  developerUrl: string | null;
  iconUrl: string | null;
  category: string;
  tags: string;
  version: string;
  status: string;
  installCount: number;
  rating: number;
  ratingCount: number;
  createdAt: string;
}

const CATEGORIES = ["general", "analytics", "communication", "content", "gamification", "assessment", "admin"];

export default function AdminMarketplaceAppsPage() {
  const [apps, setApps] = useState<MarketplaceApp[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    developer: "",
    developerUrl: "",
    iconUrl: "",
    category: "general",
    tags: "",
    version: "1.0.0",
    webhookUrl: "",
  });

  useEffect(() => {
    fetchApps();
  }, []);

  async function fetchApps() {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/marketplace-apps");
      if (!res.ok) throw new Error("Failed to load apps");
      setApps(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setIsLoading(false);
    }
  }

  function resetForm() {
    setForm({ name: "", description: "", developer: "", developerUrl: "", iconUrl: "", category: "general", tags: "", version: "1.0.0", webhookUrl: "" });
    setEditingId(null);
    setShowForm(false);
  }

  function startEdit(app: MarketplaceApp) {
    setForm({
      name: app.name,
      description: app.description,
      developer: app.developer,
      developerUrl: app.developerUrl || "",
      iconUrl: app.iconUrl || "",
      category: app.category,
      tags: app.tags,
      version: app.version,
      webhookUrl: "",
    });
    setEditingId(app.id);
    setShowForm(true);
  }

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    try {
      const url = editingId ? `/api/admin/marketplace-apps/${editingId}` : "/api/admin/marketplace-apps";
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
      setMessage(editingId ? "App updated" : "App created");
      resetForm();
      await fetchApps();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function handleStatus(id: string, status: string) {
    try {
      await fetch(`/api/admin/marketplace-apps/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      await fetchApps();
    } catch {
      // ignore
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this app?")) return;
    try {
      const res = await fetch(`/api/admin/marketplace-apps/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      await fetchApps();
      setMessage("App deleted");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to delete");
    }
  }

  if (isLoading) return <LoadingScreen fullScreen={false} message="Loading marketplace apps..." />;
  if (error) return <ErrorState message={error} onRetry={fetchApps} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">App Marketplace</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage third-party apps available for installation.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchApps}>
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
            Refresh
          </Button>
          <Button size="sm" onClick={() => { resetForm(); setShowForm(true); }}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Add App
          </Button>
        </div>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Puzzle className="h-5 w-5 text-primary" />
              {editingId ? "Edit App" : "New Marketplace App"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">App Name</label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Quiz Generator" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">Developer</label>
                <Input value={form.developer} onChange={(e) => setForm({ ...form, developer: e.target.value })} placeholder="Developer name" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground">Description</label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What does this app do?" />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">Version</label>
                <Input value={form.version} onChange={(e) => setForm({ ...form, version: e.target.value })} placeholder="1.0.0" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">Tags (JSON array)</label>
                <Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder='["quiz", "ai"]' />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">Developer URL</label>
                <Input value={form.developerUrl} onChange={(e) => setForm({ ...form, developerUrl: e.target.value })} placeholder="https://developer.example.com" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">Icon URL</label>
                <Input value={form.iconUrl} onChange={(e) => setForm({ ...form, iconUrl: e.target.value })} placeholder="https://example.com/icon.png" />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={saving || !form.name || !form.description || !form.developer}>
                {saving ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Check className="mr-1.5 h-3.5 w-3.5" />}
                {editingId ? "Update" : "Create"}
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {apps.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Puzzle className="mb-4 h-12 w-12 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No apps configured yet.</p>
            </CardContent>
          </Card>
        ) : (
          apps.map((app) => (
            <Card key={app.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {app.iconUrl ? (
                      <img src={app.iconUrl} alt="" className="h-10 w-10 rounded-lg object-cover" />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-lg font-bold text-muted-foreground">
                        {app.name[0].toUpperCase()}
                      </div>
                    )}
                    <div>
                      <CardTitle className="text-base">{app.name}</CardTitle>
                      <CardDescription>{app.developer}</CardDescription>
                    </div>
                  </div>
                  <Badge variant={app.status === "approved" ? "default" : app.status === "pending" ? "secondary" : "destructive"}>
                    {app.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-2">{app.description}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>v{app.version}</span>
                  <span className="flex items-center gap-1">
                    <Download className="h-3 w-3" /> {app.installCount}
                  </span>
                </div>
                <div className="flex gap-2">
                  {app.status !== "approved" && (
                    <Button size="sm" variant="outline" onClick={() => handleStatus(app.id, "approved")}>
                      <Check className="mr-1 h-3 w-3" /> Approve
                    </Button>
                  )}
                  {app.status !== "rejected" && (
                    <Button size="sm" variant="outline" onClick={() => handleStatus(app.id, "rejected")}>
                      <X className="mr-1 h-3 w-3" /> Reject
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => startEdit(app)}>
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(app.id)}>
                    <Trash2 className="h-3.5 w-3.5 text-red-400" />
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
