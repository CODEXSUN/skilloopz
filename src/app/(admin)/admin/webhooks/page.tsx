"use client";

import { useState, useEffect, useCallback } from "react";
import { Webhook, Plus, Trash2, RefreshCw, Loader2, Bell, BellOff, Globe, Clock, Gauge } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { ALL_WEBHOOK_EVENTS, WEBHOOK_EVENT_LABELS, getEventLabel } from "@/lib/webhook-events";

interface WebhookRecord {
  id: string;
  name: string;
  url: string;
  events: string;
  active: boolean;
  secret: string | null;
  timeoutMs: number;
  retryCount: number;
  lastStatus: string | null;
  lastSentAt: string | null;
  createdAt: string;
}

export default function AdminWebhooksPage() {
  const [webhooks, setWebhooks] = useState<WebhookRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWebhooks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/webhooks");
      if (!res.ok) throw new Error("Failed to load webhooks");
      setWebhooks(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWebhooks();
  }, [fetchWebhooks]);

  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    name: "",
    url: "",
    events: [] as string[],
    secret: "",
    timeoutMs: 5000,
    retryCount: 3,
  });
  const [submitting, setSubmitting] = useState(false);

  async function handleCreate() {
    if (!form.name.trim() || !form.url.trim() || form.events.length === 0) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/webhooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          url: form.url.trim(),
          events: form.events,
          active: true,
          secret: form.secret.trim() || undefined,
          timeoutMs: form.timeoutMs,
          retryCount: form.retryCount,
        }),
      });
      if (!res.ok) throw new Error("Failed to create");
      setForm({ name: "", url: "", events: [], secret: "", timeoutMs: 5000, retryCount: 3 });
      setShowCreate(false);
      await fetchWebhooks();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to create");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggle(wh: WebhookRecord) {
    try {
      const res = await fetch(`/api/admin/webhooks/${wh.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !wh.active }),
      });
      if (!res.ok) throw new Error("Failed to toggle");
      setWebhooks((prev) => prev.map((w) => (w.id === wh.id ? { ...w, active: !w.active } : w)));
    } catch {
      alert("Failed to toggle");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this webhook?")) return;
    try {
      const res = await fetch(`/api/admin/webhooks/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setWebhooks((prev) => prev.filter((w) => w.id !== id));
    } catch {
      alert("Failed to delete");
    }
  }

  function toggleEvent(evt: string) {
    setForm((prev) => ({
      ...prev,
      events: prev.events.includes(evt)
        ? prev.events.filter((e) => e !== evt)
        : [...prev.events, evt],
    }));
  }

  if (isLoading) return <LoadingScreen fullScreen={false} message="Loading webhooks..." />;
  if (error) return <ErrorState message={error} onRetry={fetchWebhooks} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Webhooks</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Send POST notifications to external URLs when events occur.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchWebhooks}>
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
            Refresh
          </Button>
          <Button size="sm" onClick={() => { setShowCreate(!showCreate); }}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            New Webhook
          </Button>
        </div>
      </div>

      {showCreate && (
        <div className="rounded-xl border border-border bg-muted/10 p-4 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Name</label>
              <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="My webhook" autoFocus />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">URL</label>
              <Input value={form.url} onChange={(e) => setForm((p) => ({ ...p, url: e.target.value }))} placeholder="https://example.com/hook" />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Secret (optional)</label>
              <Input value={form.secret} onChange={(e) => setForm((p) => ({ ...p, secret: e.target.value }))} placeholder="shared secret" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Timeout (ms)</label>
              <Input type="number" value={form.timeoutMs} onChange={(e) => setForm((p) => ({ ...p, timeoutMs: Number(e.target.value) || 5000 }))} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Retries</label>
              <Input type="number" value={form.retryCount} onChange={(e) => setForm((p) => ({ ...p, retryCount: Number(e.target.value) || 3 }))} />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">Events</label>
            <div className="flex flex-wrap gap-1.5">
              {ALL_WEBHOOK_EVENTS.map((evt) => (
                <button
                  key={evt}
                  type="button"
                  onClick={() => toggleEvent(evt)}
                  className={`rounded-lg px-2.5 py-1 text-[10px] font-medium transition-colors ${
                    form.events.includes(evt)
                      ? "bg-primary/20 text-primary"
                      : "bg-muted/30 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {getEventLabel(evt)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button size="sm" onClick={handleCreate} disabled={submitting || !form.name || !form.url || form.events.length === 0}>
              {submitting ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : null}
              Create
            </Button>
          </div>
        </div>
      )}

      {webhooks.length === 0 ? (
        <EmptyState icon={Webhook} title="No webhooks" description="Create a webhook to receive event notifications." />
      ) : (
        <div className="space-y-3">
          {webhooks.map((wh) => {
            const events: string[] = JSON.parse(wh.events);
            return (
              <div key={wh.id} className="rounded-xl border border-border bg-muted/5 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{wh.name}</span>
                      <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase ${
                        wh.active ? "bg-emerald-500/10 text-emerald-400" : "bg-muted/30 text-muted-foreground"
                      }`}>
                        {wh.active ? "Active" : "Paused"}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground font-mono truncate">{wh.url}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {events.map((evt) => (
                        <span key={evt} className="rounded-md bg-muted/30 px-1.5 py-0.5 text-[9px] text-muted-foreground">
                          {getEventLabel(evt)}
                        </span>
                      ))}
                    </div>
                    <div className="mt-2 flex items-center gap-4 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{wh.timeoutMs}ms</span>
                      <span className="flex items-center gap-1"><Gauge className="h-3 w-3" />{wh.retryCount} retries</span>
                      {wh.lastStatus && (
                        <span className={`flex items-center gap-1 ${
                          wh.lastStatus === "success" ? "text-emerald-400" : "text-red-400"
                        }`}>
                          <Globe className="h-3 w-3" />{wh.lastStatus}
                        </span>
                      )}
                      {wh.lastSentAt && (
                        <span>Last: {new Date(wh.lastSentAt).toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleToggle(wh)}
                      className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                      title={wh.active ? "Pause" : "Activate"}
                    >
                      {wh.active ? <BellOff className="h-3.5 w-3.5" /> : <Bell className="h-3.5 w-3.5" />}
                    </button>
                    <button
                      onClick={() => handleDelete(wh.id)}
                      className="rounded-lg p-1.5 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
