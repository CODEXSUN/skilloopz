"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, ExternalLink, FileText, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CustomPage {
  id: string;
  title: string;
  slug: string;
  path: string;
  status: string;
  layout: string;
  createdAt: string;
  _count: { sections: number };
}

const statusBadge: Record<string, "default" | "secondary" | "outline"> = {
  published: "default",
  draft: "secondary",
};

export default function AdminPagesPage() {
  const router = useRouter();
  const [pages, setPages] = useState<CustomPage[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [createForm, setCreateForm] = useState({
    title: "",
    slug: "",
    path: "",
    status: "draft" as string,
    layout: "default" as string,
  });

  useEffect(() => {
    fetch("/api/admin/pages")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load pages");
        return res.json();
      })
      .then((data) => {
        setPages(data);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setIsLoading(false);
      });
  }, []);

  async function handleCreate() {
    setCreating(true);
    try {
      const res = await fetch("/api/admin/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(typeof data.error === "string" ? data.error : "Failed to create page");
      }
      setShowCreate(false);
      setCreateForm({ title: "", slug: "", path: "", status: "draft", layout: "default" });
      const refreshed = await fetch("/api/admin/pages");
      setPages(await refreshed.json());
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to create page");
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this page? This cannot be undone.")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/pages/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete page");
      setPages((prev) => prev?.filter((p) => p.id !== id) ?? null);
    } catch {
      alert("Failed to delete page");
    } finally {
      setDeleting(null);
    }
  }

  function generateSlug(title: string) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function handleTitleChange(title: string) {
    const slug = generateSlug(title);
    setCreateForm((prev) => ({
      ...prev,
      title,
      slug,
      path: slug ? `/${slug}` : "",
    }));
  }

  if (isLoading) return <LoadingScreen fullScreen={false} message="Loading pages..." />;

  if (error) return <ErrorState message={error} onRetry={() => router.refresh()} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pages</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage landing pages and site content.
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4" />
          New Page
        </Button>
      </div>

      {!pages || pages.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No pages yet"
          description="Create your first custom page."
          actionLabel="Create Page"
          onAction={() => setShowCreate(true)}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pages.map((page) => (
            <Card key={page.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <CardTitle className="truncate">{page.title}</CardTitle>
                    <CardDescription className="truncate">
                      {page.path}
                    </CardDescription>
                  </div>
                  <Badge
                    variant={statusBadge[page.status] ?? "secondary"}
                    className="ml-2 shrink-0"
                  >
                    {page.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>Slug: {page.slug}</p>
                  <p>Layout: {page.layout}</p>
                  <p>{page._count.sections} sections</p>
                </div>
              </CardContent>
              <div className="flex gap-2 border-t border-border px-6 py-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push(`/admin/pages/${page.slug}/edit`)}
                >
                  <ExternalLink className="h-4 w-4" />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={deleting === page.id}
                  onClick={() => handleDelete(page.id)}
                >
                  {deleting === page.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Page</DialogTitle>
            <DialogDescription>
              Add a new custom page to your site.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={createForm.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="About Us"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={createForm.slug}
                onChange={(e) =>
                  setCreateForm((prev) => ({ ...prev, slug: e.target.value }))
                }
                placeholder="about-us"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="path">Path</Label>
              <Input
                id="path"
                value={createForm.path}
                onChange={(e) =>
                  setCreateForm((prev) => ({ ...prev, path: e.target.value }))
                }
                placeholder="/about"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={createForm.status}
                  onValueChange={(v) =>
                    setCreateForm((prev) => ({ ...prev, status: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Layout</Label>
                <Select
                  value={createForm.layout}
                  onValueChange={(v) =>
                    setCreateForm((prev) => ({ ...prev, layout: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="full_width">Full Width</SelectItem>
                    <SelectItem value="landing">Landing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreate(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={creating || !createForm.title || !createForm.slug}
            >
              {creating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
