"use client";

import { useState, useEffect } from "react";
import { FileText, Save, Layers, Loader2, X, Plus } from "lucide-react";

interface PageTemplate {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string;
  sections: string;
  createdAt: string;
}

interface TemplateLibraryPanelProps {
  open: boolean;
  onClose: () => void;
  pageSlug?: string;
  onApplyTemplate: (sections: string) => void;
}

export function TemplateLibraryPanel({ open, onClose, pageSlug, onApplyTemplate }: TemplateLibraryPanelProps) {
  const [templates, setTemplates] = useState<PageTemplate[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch("/api/admin/templates")
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then(setTemplates)
      .catch(() => setTemplates([]))
      .finally(() => setLoading(false));
  }, [open]);

  async function handleSaveCurrent() {
    if (!pageSlug) return;
    setSaving(true);
    try {
      const sectionsRes = await fetch(`/api/admin/pages/${pageSlug}/sections`);
      if (!sectionsRes.ok) throw new Error("Failed to load page sections");
      const sections = await sectionsRes.json();
      const name = `Page snapshot (${new Date().toLocaleDateString()})`;
      const res = await fetch("/api/admin/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description: `Auto-saved from Dev Mode on ${new Date().toLocaleString()}`,
          category: "page",
          sections: JSON.stringify(
            sections.map((s: { blockType: string; sortOrder: number; content: string; settings: string }) => ({
              blockType: s.blockType,
              sortOrder: s.sortOrder,
              content: s.content,
              settings: s.settings,
            }))
          ),
        }),
      });
      if (!res.ok) throw new Error();
      const refreshed = await fetch("/api/admin/templates");
      setTemplates(await refreshed.json());
    } catch {
      alert("Failed to save template");
    } finally {
      setSaving(false);
    }
  }

  async function handleApply(id: string) {
    setApplying(id);
    try {
      const res = await fetch(`/api/admin/templates/${id}`);
      if (!res.ok) throw new Error();
      const template: PageTemplate = await res.json();
      onApplyTemplate(template.sections);
      onClose();
    } catch {
      alert("Failed to load template");
    } finally {
      setApplying(null);
    }
  }

  if (!open) return null;

  const filtered = templates
    ? categoryFilter === "all"
      ? templates
      : templates.filter((t) => t.category === categoryFilter)
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl border border-border bg-background shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold text-foreground">Template Library</h2>
          <button onClick={onClose} className="rounded-lg p-1 text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <div className="flex items-center gap-2">
            <div className="flex gap-1 rounded-lg bg-muted/30 p-0.5">
              {["all", "page", "dashboard", "marketing"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors ${
                    categoryFilter === cat
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="flex-1" />
            <button
              onClick={handleSaveCurrent}
              disabled={saving || !pageSlug}
              className="flex items-center gap-1.5 rounded-lg bg-primary-500 px-3 py-1.5 text-[10px] font-bold text-white hover:bg-primary-400 transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
              Save Current
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-sm text-muted-foreground">
              <FileText className="h-8 w-8 opacity-30" />
              <p>No templates found</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[50vh] overflow-y-auto custom-scrollbar">
              {filtered.map((t) => {
                let sectionCount = 0;
                try {
                  const data = JSON.parse(t.sections);
                  sectionCount = Array.isArray(data) ? data.length : Array.isArray(data.sections) ? data.sections.length : 0;
                } catch {}
                return (
                  <div
                    key={t.id}
                    className="flex items-center gap-3 rounded-xl border border-border bg-[rgba(255,255,255,0.02)] p-3 transition-colors hover:border-[rgba(255,255,255,0.12)]"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted/30">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{t.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground capitalize">{t.category}</span>
                        <span className="text-xs text-muted-foreground">·</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Layers className="h-3 w-3" />
                          {sectionCount}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleApply(t.id)}
                      disabled={applying === t.id}
                      className="flex items-center gap-1 rounded-lg bg-foreground/10 px-2.5 py-1.5 text-[10px] font-medium text-foreground hover:bg-foreground/20 transition-colors disabled:opacity-50"
                    >
                      {applying === t.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Plus className="h-3 w-3" />
                      )}
                      Apply
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
