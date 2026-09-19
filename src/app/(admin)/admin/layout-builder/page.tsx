"use client";

import { useState, useEffect, useCallback } from "react";
import { Layers, Plus, Trash2, RefreshCw, Loader2, GripVertical, Pencil, X, Check, LayoutTemplate } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";

interface LayoutRecord {
  id: string;
  name: string;
  description: string;
  slug: string;
  slots: string[];
  pageCount: number;
  createdAt: string;
}

export default function AdminLayoutBuilderPage() {
  const [layouts, setLayouts] = useState<LayoutRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLayouts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/layout-templates");
      if (!res.ok) throw new Error("Failed to load layouts");
      setLayouts(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLayouts();
  }, [fetchLayouts]);

  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", description: "", slug: "", slots: ["main"] as string[] });
  const [submitting, setSubmitting] = useState(false);

  function resetForm() {
    setForm({ name: "", description: "", slug: "", slots: ["main"] });
  }

  function startEdit(l: LayoutRecord) {
    setEditingId(l.id);
    setForm({ name: l.name, description: l.description || "", slug: l.slug, slots: [...l.slots] });
    setShowCreate(false);
  }

  function addSlot() {
    setForm((p) => ({ ...p, slots: [...p.slots, ""] }));
  }

  function removeSlot(i: number) {
    setForm((p) => ({ ...p, slots: p.slots.filter((_, idx) => idx !== i) }));
  }

  function updateSlot(i: number, val: string) {
    setForm((p) => {
      const slots = [...p.slots];
      slots[i] = val;
      return { ...p, slots };
    });
  }

  function moveSlot(from: number, to: number) {
    if (to < 0 || to >= form.slots.length) return;
    setForm((p) => {
      const slots = [...p.slots];
      const [moved] = slots.splice(from, 1);
      slots.splice(to, 0, moved);
      return { ...p, slots };
    });
  }

  async function handleSave() {
    if (!form.name.trim() || !form.slug.trim() || form.slots.filter(Boolean).length === 0) return;
    setSubmitting(true);
    try {
      const cleanSlots = form.slots.filter(Boolean);
      const body = {
        name: form.name.trim(),
        description: form.description.trim(),
        slug: form.slug.trim().toLowerCase().replace(/\s+/g, "-"),
        slots: cleanSlots,
      };

      const url = editingId
        ? `/api/admin/layout-templates/${editingId}`
        : "/api/admin/layout-templates";

      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }

      resetForm();
      setShowCreate(false);
      setEditingId(null);
      await fetchLayouts();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this layout template? Pages using it must be reassigned first.")) return;
    try {
      const res = await fetch(`/api/admin/layout-templates/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to delete");
        return;
      }
      setLayouts((prev) => prev.filter((l) => l.id !== id));
    } catch {
      alert("Failed to delete");
    }
  }

  if (isLoading) return <LoadingScreen fullScreen={false} message="Loading layouts..." />;
  if (error) return <ErrorState message={error} onRetry={fetchLayouts} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Layout Builder</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create and manage page layout templates with named content slots.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchLayouts}>
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
            Refresh
          </Button>
          <Button size="sm" onClick={() => { setShowCreate(!showCreate); setEditingId(null); resetForm(); }}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            New Layout
          </Button>
        </div>
      </div>

      {(showCreate || editingId) && (
        <div className="rounded-xl border border-border bg-muted/10 p-4 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Name</label>
              <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Two Column" autoFocus />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Slug</label>
              <Input value={form.slug} onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))} placeholder="two-column" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">Description</label>
            <Input value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="A two-column layout with sidebar" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs text-muted-foreground">Slots</label>
              <Button variant="outline" size="sm" onClick={addSlot}>
                <Plus className="mr-1 h-3 w-3" />
                Add Slot
              </Button>
            </div>
            <div className="space-y-1.5">
              {form.slots.map((slot, i) => (
                <div key={i} className="flex items-center gap-2">
                  <button
                    onClick={() => moveSlot(i, i - 1)}
                    className="p-1 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-20"
                    disabled={i === 0}
                  >
                    <GripVertical className="h-3.5 w-3.5" />
                  </button>
                  <Input
                    value={slot}
                    onChange={(e) => updateSlot(i, e.target.value)}
                    placeholder={`Slot ${i + 1}`}
                    className="flex-1"
                  />
                  {form.slots.length > 1 && (
                    <button
                      onClick={() => removeSlot(i)}
                      className="rounded-lg p-1.5 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => { setShowCreate(false); setEditingId(null); resetForm(); }}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} disabled={submitting || !form.name || !form.slug || form.slots.filter(Boolean).length === 0}>
              {submitting ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Check className="mr-1.5 h-3.5 w-3.5" />}
              {editingId ? "Update" : "Create"}
            </Button>
          </div>
        </div>
      )}

      {layouts.length === 0 ? (
        <EmptyState
          icon={LayoutTemplate}
          title="No layout templates"
          description="Create your first layout template to define page structure."
        />
      ) : (
        <div className="space-y-3">
          {layouts.map((l) => (
            <div key={l.id} className="rounded-xl border border-border bg-muted/5 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{l.name}</span>
                    <code className="rounded bg-muted/30 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                      {l.slug}
                    </code>
                  </div>
                  {l.description && (
                    <p className="mt-0.5 text-xs text-muted-foreground">{l.description}</p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {l.slots.map((slot) => (
                      <span
                        key={slot}
                        className="inline-flex items-center gap-1 rounded-md border border-border/50 bg-muted/20 px-2 py-0.5 text-[10px] font-medium text-foreground"
                      >
                        <Layers className="h-3 w-3 text-muted-foreground" />
                        {slot}
                      </span>
                    ))}
                  </div>
                  <p className="mt-1.5 text-[10px] text-muted-foreground">
                    {l.pageCount} page{l.pageCount !== 1 ? "s" : ""} using this layout
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => startEdit(l)}
                    className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                    title="Edit"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(l.id)}
                    disabled={l.pageCount > 0}
                    className="rounded-lg p-1.5 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-30"
                    title={l.pageCount > 0 ? "In use" : "Delete"}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
