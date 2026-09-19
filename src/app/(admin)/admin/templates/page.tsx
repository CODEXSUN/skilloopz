"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Layers, Loader2, Save, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Template {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string;
  sections: string;
  thumbnail: string | null;
  createdAt: string;
}

interface CustomPage {
  id: string;
  title: string;
  slug: string;
  path: string;
}

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState<Template[] | null>(null);
  const [pages, setPages] = useState<CustomPage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  const [templateCategory, setTemplateCategory] = useState("page");
  const [selectedSourcePageId, setSelectedSourcePageId] = useState("");
  const [selectedSourcePageSlug, setSelectedSourcePageSlug] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const [showApplyDialog, setShowApplyDialog] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applyTemplateId, setApplyTemplateId] = useState<string | null>(null);
  const [applyTemplateName, setApplyTemplateName] = useState("");
  const [applyTargetPageId, setApplyTargetPageId] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/templates").then((r) => { if (!r.ok) throw new Error("Failed to load templates"); return r.json(); }),
      fetch("/api/admin/pages").then((r) => { if (!r.ok) throw new Error("Failed to load pages"); return r.json(); }),
    ])
      .then(([templatesData, pagesData]) => {
        setTemplates(templatesData);
        setPages(pagesData);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setIsLoading(false);
      });
  }, []);

  function openSaveDialog() {
    setTemplateName("");
    setTemplateDescription("");
    setTemplateCategory("page");
    setSelectedSourcePageId("");
    setSelectedSourcePageSlug("");
    setShowSaveDialog(true);
  }

  function openApplyDialog(template: Template) {
    setApplyTemplateId(template.id);
    setApplyTemplateName(template.name);
    setApplyTargetPageId("");
    setShowApplyDialog(true);
  }

  async function handleSaveTemplate() {
    if (!templateName || !selectedSourcePageSlug) return;
    setSaving(true);
    try {
      const sectionsRes = await fetch(`/api/admin/pages/${selectedSourcePageSlug}/sections`);
      if (!sectionsRes.ok) throw new Error("Failed to load page sections");
      const sections = await sectionsRes.json();

      const payload = JSON.stringify({
        sections: sections.map((s: { blockType: string; sortOrder: number; content: string; settings: string }) => ({
          blockType: s.blockType,
          sortOrder: s.sortOrder,
          content: s.content,
          settings: s.settings,
        })),
      });

      const res = await fetch("/api/admin/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: templateName,
          description: templateDescription || null,
          category: templateCategory,
          sections: payload,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(typeof data.error === "string" ? data.error : "Failed to save template");
      }

      setShowSaveDialog(false);
      const refreshed = await fetch("/api/admin/templates");
      setTemplates(await refreshed.json());
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save template");
    } finally {
      setSaving(false);
    }
  }

  async function handleApplyTemplate() {
    if (!applyTemplateId || !applyTargetPageId) return;
    setApplying(true);
    try {
      const res = await fetch(`/api/admin/templates/${applyTemplateId}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageId: applyTargetPageId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(typeof data.error === "string" ? data.error : "Failed to apply template");
      }

      setShowApplyDialog(false);
      alert(`Template "${applyTemplateName}" applied to page successfully!`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to apply template");
    } finally {
      setApplying(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete template "${name}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/templates/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete template");
      setTemplates((prev) => prev?.filter((t) => t.id !== id) ?? null);
    } catch {
      alert("Failed to delete template");
    } finally {
      setDeleting(null);
    }
  }

  const selectedSourcePage = pages.find((p) => p.id === selectedSourcePageId);

  if (isLoading) return <LoadingScreen fullScreen={false} message="Loading templates..." />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Page Templates</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Saved page layouts and section structures.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1 rounded-lg bg-muted/30 p-0.5">
            {["all", "page", "dashboard", "marketing"].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors ${
                  activeCategory === cat
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <Button onClick={openSaveDialog}>
            <Save className="h-4 w-4" />
            Save as Template
          </Button>
        </div>
      </div>

      {!templates || templates.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No templates yet"
          description="Save a page layout as a template to reuse it."
          actionLabel="Save as Template"
          onAction={openSaveDialog}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(() => {
            const parsed = templates.map((t) => {
              let sections: { blockType: string }[] = [];
              try {
                const data = JSON.parse(t.sections);
                if (Array.isArray(data)) sections = data;
                else if (Array.isArray(data.sections)) sections = data.sections;
              } catch {}
              return { ...t, _sections: sections };
            });
            return parsed
              .filter((t) => activeCategory === "all" || t.category === activeCategory)
              .map((template) => {
            return (
              <Card key={template.id}>
                <CardHeader>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="truncate">{template.name}</CardTitle>
                      <span className="rounded-md bg-primary-500/10 px-1.5 py-0.5 text-[10px] font-medium text-primary-400 capitalize">{template.category}</span>
                    </div>
                    {template.description && (
                      <CardDescription className="mt-1 line-clamp-2">
                        {template.description}
                      </CardDescription>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Layers className="h-4 w-4" />
                      <span>{template._sections.length} section{template._sections.length !== 1 ? "s" : ""}</span>
                    </div>
                    {template._sections.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {template._sections.slice(0, 5).map((s: { blockType: string }, i: number) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {s.blockType}
                          </Badge>
                        ))}
                        {template._sections.length > 5 && (
                          <span className="text-xs text-muted-foreground">+{template._sections.length - 5} more</span>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
                <div className="flex gap-2 border-t border-border px-6 py-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openApplyDialog(template)}
                  >
                    <Plus className="h-4 w-4" />
                    Apply to Page
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={deleting === template.id}
                    onClick={() => handleDelete(template.id, template.name)}
                  >
                    {deleting === template.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    Delete
                  </Button>
                </div>
              </Card>
            );
          });
          })()}
        </div>
      )}

      {/* Save as Template Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save as Template</DialogTitle>
            <DialogDescription>
              Save a page layout as a reusable template.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="templateName">Template Name</Label>
              <Input
                id="templateName"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="e.g. Two Column Layout"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="templateDescription">Description (optional)</Label>
              <Textarea
                id="templateDescription"
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
                placeholder="Brief description of this template"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={templateCategory} onValueChange={setTemplateCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="page">Page</SelectItem>
                  <SelectItem value="dashboard">Dashboard</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Source Page</Label>
              <Select value={selectedSourcePageId} onValueChange={(v) => {
                setSelectedSourcePageId(v);
                const page = pages.find((p) => p.id === v);
                setSelectedSourcePageSlug(page?.slug ?? "");
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a page..." />
                </SelectTrigger>
                <SelectContent>
                  {pages.map((page) => (
                    <SelectItem key={page.id} value={page.id}>
                      {page.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedSourcePage && (
                <p className="text-xs text-muted-foreground">
                  Path: {selectedSourcePage.path}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveTemplate}
              disabled={saving || !templateName || !selectedSourcePageSlug}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}
              Save Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Apply Template Dialog */}
      <Dialog open={showApplyDialog} onOpenChange={setShowApplyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply Template</DialogTitle>
            <DialogDescription>
              Apply &ldquo;{applyTemplateName}&rdquo; to a page. This will replace all existing sections.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Target Page</Label>
              <Select value={applyTargetPageId} onValueChange={setApplyTargetPageId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a target page..." />
                </SelectTrigger>
                <SelectContent>
                  {pages.map((page) => (
                    <SelectItem key={page.id} value={page.id}>
                      {page.title} ({page.path})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApplyDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleApplyTemplate}
              disabled={applying || !applyTargetPageId}
            >
              {applying ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}
              Apply Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
