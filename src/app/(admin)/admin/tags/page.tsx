"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

interface Tag {
  id: string;
  name: string;
  slug: string;
  _count: { courses: number };
}

export default function AdminTagsPage() {
  const [tags, setTags] = useState<Tag[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [name, setName] = useState("");

  useEffect(() => {
    fetch("/api/admin/tags")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load tags");
        return res.json();
      })
      .then((data) => {
        setTags(data);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setIsLoading(false);
      });
  }, []);

  function openCreate() {
    setEditingId(null);
    setName("");
    setShowDialog(true);
  }

  function openEdit(tag: Tag) {
    setEditingId(tag.id);
    setName(tag.name);
    setShowDialog(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const url = editingId
        ? `/api/admin/tags/${editingId}`
        : "/api/admin/tags";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
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
      const refreshed = await fetch("/api/admin/tags");
      setTags(await refreshed.json());
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save tag");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string, tagName: string) {
    if (!confirm(`Delete tag "${tagName}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/tags/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete tag");
      setTags((prev) => prev?.filter((t) => t.id !== id) ?? null);
    } catch {
      alert("Failed to delete tag");
    } finally {
      setDeleting(null);
    }
  }

  if (isLoading)
    return <LoadingScreen fullScreen={false} message="Loading tags..." />;

  if (error) return <ErrorState message={error} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tags</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage course tags.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Add Tag
        </Button>
      </div>

      {!tags || tags.length === 0 ? (
        <EmptyState
          icon={Loader2}
          title="No tags yet"
          description="Create your first tag to organize courses."
          actionLabel="Add Tag"
          onAction={openCreate}
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted">
              <tr>
                <th className="px-4 py-3 font-medium text-muted-foreground">Name</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Slug</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Courses</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {tags.map((tag) => (
                <tr
                  key={tag.id}
                  className="group transition-colors hover:bg-muted/50"
                >
                  <td className="px-4 py-3 font-medium text-foreground">
                    {tag.name}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                    {tag.slug}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {tag._count.courses}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEdit(tag)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-all hover:bg-blue-500/10 hover:text-blue-400"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(tag.id, tag.name)}
                        disabled={deleting === tag.id}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-all hover:bg-red-500/10 hover:text-red-400"
                        title="Delete"
                      >
                        {deleting === tag.id ? (
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
            <DialogTitle>{editingId ? "Edit Tag" : "Add Tag"}</DialogTitle>
            <DialogDescription>
              {editingId
                ? "Update the tag name."
                : "Create a new course tag."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="JavaScript"
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
              disabled={saving || !name}
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
