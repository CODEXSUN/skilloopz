"use client";

import { useState, useEffect } from "react";
import { Plus, Puzzle, Loader2, Trash2, RefreshCw, Check, X, Settings, Power } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { ErrorState } from "@/components/ui/error-state";
import { Badge } from "@/components/ui/badge";

interface Plugin {
  id: string;
  name: string;
  slug: string;
  description: string;
  version: string;
  author: string;
  enabled: boolean;
  config: string;
  hooks: string;
  webhookUrl: string | null;
  iconUrl: string | null;
  createdAt: string;
}

const HOOK_OPTIONS = [
  "before_login", "after_login", "before_signup", "after_signup",
  "before_purchase", "after_purchase", "before_course_publish",
  "after_course_publish", "before_lesson_complete", "after_lesson_complete",
  "on_xp_award", "on_badge_unlock", "on_notification", "on_webhook_dispatch", "custom",
];

export default function AdminPluginsPage() {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showConfig, setShowConfig] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    author: "",
    version: "1.0.0",
    webhookUrl: "",
    iconUrl: "",
    hooks: [] as string[],
    config: "{}",
  });

  useEffect(() => {
    fetchPlugins();
  }, []);

  async function fetchPlugins() {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/plugins");
      if (!res.ok) throw new Error("Failed to load plugins");
      setPlugins(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setIsLoading(false);
    }
  }

  function resetForm() {
    setForm({ name: "", slug: "", description: "", author: "", version: "1.0.0", webhookUrl: "", iconUrl: "", hooks: [], config: "{}" });
    setEditingSlug(null);
    setShowForm(false);
  }

  function startEdit(plugin: Plugin) {
    setForm({
      name: plugin.name,
      slug: plugin.slug,
      description: plugin.description,
      author: plugin.author,
      version: plugin.version,
      webhookUrl: plugin.webhookUrl || "",
      iconUrl: plugin.iconUrl || "",
      hooks: JSON.parse(plugin.hooks || "[]"),
      config: plugin.config,
    });
    setEditingSlug(plugin.slug);
    setShowForm(true);
  }

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    try {
      const url = editingSlug ? `/api/admin/plugins/${editingSlug}` : "/api/admin/plugins";
      const method = editingSlug ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, hooks: JSON.stringify(form.hooks) }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }
      setMessage(editingSlug ? "Plugin updated" : "Plugin created");
      resetForm();
      await fetchPlugins();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(slug: string, enabled: boolean) {
    try {
      await fetch(`/api/admin/plugins/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled }),
      });
      await fetchPlugins();
    } catch {
      // ignore
    }
  }

  async function handleDelete(slug: string) {
    if (!confirm("Delete this plugin?")) return;
    try {
      const res = await fetch(`/api/admin/plugins/${slug}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      await fetchPlugins();
      setMessage("Plugin deleted");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to delete");
    }
  }

  if (isLoading) return <LoadingScreen fullScreen={false} message="Loading plugins..." />;
  if (error) return <ErrorState message={error} onRetry={fetchPlugins} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Plugins</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage extensions and plugins that hook into platform events.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchPlugins}>
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
            Refresh
          </Button>
          <Button size="sm" onClick={() => { resetForm(); setShowForm(true); }}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Add Plugin
          </Button>
        </div>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Puzzle className="h-5 w-5 text-primary" />
              {editingSlug ? "Edit Plugin" : "New Plugin"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">Name</label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Auto-Grader" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">Slug</label>
                <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })} placeholder="auto-grader" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground">Description</label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What does this plugin do?" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">Author</label>
                <Input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} placeholder="Developer name" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">Version</label>
                <Input value={form.version} onChange={(e) => setForm({ ...form, version: e.target.value })} placeholder="1.0.0" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground">Webhook URL <span className="text-muted-foreground">(optional)</span></label>
              <Input value={form.webhookUrl} onChange={(e) => setForm({ ...form, webhookUrl: e.target.value })} placeholder="https://your-plugin.example.com/webhook" />
              <p className="text-[10px] text-muted-foreground">
                Plugins receive POST requests with {"{"}hook, plugin, payload{"}"} when triggered.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground">Hooks</label>
              <div className="grid grid-cols-3 gap-2">
                {HOOK_OPTIONS.map((hook) => (
                  <label key={hook} className="flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={form.hooks.includes(hook)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setForm({ ...form, hooks: [...form.hooks, hook] });
                        } else {
                          setForm({ ...form, hooks: form.hooks.filter((h) => h !== hook) });
                        }
                      }}
                      className="rounded border-border"
                    />
                    <span className="text-muted-foreground">{hook}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={saving || !form.name || !form.slug || !form.description || !form.author}>
                {saving ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Check className="mr-1.5 h-3.5 w-3.5" />}
                {editingSlug ? "Update" : "Create"}
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
        {plugins.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Puzzle className="mb-4 h-12 w-12 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No plugins installed yet.</p>
              <p className="text-xs text-muted-foreground">Add your first plugin to extend platform functionality.</p>
            </CardContent>
          </Card>
        ) : (
          plugins.map((plugin) => (
            <Card key={plugin.slug}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  {plugin.iconUrl ? (
                    <img src={plugin.iconUrl} alt="" className="h-10 w-10 rounded-lg object-cover" />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-lg font-bold text-muted-foreground">
                      {plugin.name[0].toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground">{plugin.name}</p>
                      <Badge variant="secondary" className="text-[10px]">v{plugin.version}</Badge>
                      {plugin.enabled ? (
                        <Badge variant="default" className="text-[10px]">Active</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[10px]">Inactive</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{plugin.author} · {plugin.description}</p>
                    {plugin.hooks && plugin.hooks !== "[]" && (
                      <div className="flex gap-1 mt-1">
                        {JSON.parse(plugin.hooks).slice(0, 3).map((hook: string) => (
                          <span key={hook} className="text-[10px] rounded bg-muted px-1.5 py-0.5 text-muted-foreground">
                            {hook}
                          </span>
                        ))}
                        {JSON.parse(plugin.hooks).length > 3 && (
                          <span className="text-[10px] text-muted-foreground">+{JSON.parse(plugin.hooks).length - 3}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={plugin.enabled} onCheckedChange={(v) => handleToggle(plugin.slug, v)} />
                  <Button variant="ghost" size="icon" onClick={() => setShowConfig(showConfig === plugin.slug ? null : plugin.slug)}>
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => startEdit(plugin)}>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(plugin.slug)}>
                    <Trash2 className="h-4 w-4 text-red-400" />
                  </Button>
                </div>
              </CardContent>
              {showConfig === plugin.slug && (
                <div className="border-t border-border px-4 py-3">
                  <p className="text-xs font-medium text-foreground mb-2">Plugin Config (JSON)</p>
                  <pre className="text-xs text-muted-foreground bg-muted rounded-lg p-3 overflow-auto max-h-40">
                    {plugin.config}
                  </pre>
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
