"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, GripVertical, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  sortOrder: number;
  createdAt: string;
}

interface CategoryForm {
  name: string;
  description: string;
  icon: string;
  sortOrder: number;
}

const defaultForm: CategoryForm = {
  name: "",
  description: "",
  icon: "",
  sortOrder: 0,
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [form, setForm] = useState<CategoryForm>(defaultForm);

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load categories");
        return res.json();
      })
      .then((data) => {
        setCategories(data);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setIsLoading(false);
      });
  }, []);

  function openCreate() {
    setEditingId(null);
    setForm(defaultForm);
    setShowDialog(true);
  }

  function openEdit(cat: Category) {
    setEditingId(cat.id);
    setForm({
      name: cat.name,
      description: cat.description ?? "",
      icon: cat.icon ?? "",
      sortOrder: cat.sortOrder,
    });
    setShowDialog(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const url = editingId
        ? `/api/admin/categories/${editingId}`
        : "/api/admin/categories";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(
          typeof data.error === "string"
            ? data.error
            : JSON.stringify(data.error),
        );
      }

      setShowDialog(false);
      const refreshed = await fetch("/api/admin/categories");
      setCategories(await refreshed.json());
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save category");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete category "${name}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete category");
      setCategories((prev) => prev?.filter((c) => c.id !== id) ?? null);
    } catch {
      alert("Failed to delete category");
    } finally {
      setDeleting(null);
    }
  }

  if (isLoading)
    return <LoadingScreen fullScreen={false} message="Loading categories..." />;

  if (error) return <ErrorState message={error} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Categories</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage course categories.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Add Category
        </Button>
      </div>

      {!categories || categories.length === 0 ? (
        <EmptyState
          icon={GripVertical}
          title="No categories yet"
          description="Create your first category to organize courses."
          actionLabel="Add Category"
          onAction={openCreate}
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted">
              <tr>
                <th className="px-4 py-3 font-medium text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <GripVertical className="h-3.5 w-3.5" />
                    Order
                  </span>
                </th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Name</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Slug</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Description</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Icon</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {categories.map((cat) => (
                <tr
                  key={cat.id}
                  className="group transition-colors hover:bg-muted/50"
                >
                  <td className="px-4 py-3 text-muted-foreground">
                    {cat.sortOrder}
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground">
                    {cat.name}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                    {cat.slug}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground max-w-[200px] truncate">
                    {cat.description ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                    {cat.icon ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEdit(cat)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-all hover:bg-blue-500/10 hover:text-blue-400"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id, cat.name)}
                        disabled={deleting === cat.id}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-all hover:bg-red-500/10 hover:text-red-400"
                        title="Delete"
                      >
                        {deleting === cat.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Category" : "Add Category"}</DialogTitle>
            <DialogDescription>
              {editingId
                ? "Update the category details."
                : "Create a new course category."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Web Development"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Courses about web development..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="icon">Icon</Label>
              <Input
                id="icon"
                value={form.icon}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, icon: e.target.value }))
                }
                placeholder="Code2"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sortOrder">Sort Order</Label>
              <Input
                id="sortOrder"
                type="number"
                value={form.sortOrder}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    sortOrder: parseInt(e.target.value) || 0,
                  }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !form.name}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}
              {editingId ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
