"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Plus, Edit, Trash2, Eye, Loader2, FileText, Save, X,
} from "lucide-react";
import { format } from "date-fns";

import { LoadingScreen } from "@/components/ui/loading-screen";
import { ErrorState } from "@/components/ui/error-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

const easing = [0.16, 1, 0.3, 1] as const;

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  status: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    fullName: string | null;
    avatarUrl: string | null;
  };
}

type View = "list" | "edit";

export default function AdminBlogPage() {
  const [view, setView] = useState<View>("list");
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    coverImage: "",
    status: "draft" as "draft" | "published",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetch("/api/blog?status=all")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then(setPosts)
      .catch(() => setError("Failed to load posts"))
      .finally(() => setIsLoading(false));
  }, [refreshKey]);

  const handleRefresh = useCallback(() => {
    setIsLoading(true);
    setRefreshKey((k) => k + 1);
  }, []);

  function handleNew() {
    setEditingPost(null);
    setFormData({ title: "", slug: "", excerpt: "", content: "", coverImage: "", status: "draft" });
    setView("edit");
  }

  function handleEdit(post: BlogPost) {
    setEditingPost(post);
    setFormData({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt ?? "",
      content: post.content,
      coverImage: post.coverImage ?? "",
      status: post.status as "draft" | "published",
    });
    setView("edit");
  }

  async function handleSave() {
    if (!formData.title || !formData.slug || !formData.content) return;

    setIsSaving(true);
    try {
      const url = editingPost ? `/api/blog/${editingPost.slug}` : "/api/blog";
      const method = editingPost ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error ?? "Failed to save");
        return;
      }

      setView("list");
      handleRefresh();
    } catch {
      alert("Failed to save");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(slug: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;

    try {
      const res = await fetch(`/api/blog/${slug}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      handleRefresh();
    } catch {
      alert("Failed to delete");
    }
  }

  function handleTitleChange(title: string) {
    setFormData((prev) => ({
      ...prev,
      title,
      slug: prev.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    }));
  }

  if (isLoading) return <LoadingScreen fullScreen={false} message="Loading blog posts..." />;
  if (error) return <ErrorState message={error} onRetry={handleRefresh} />;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: easing }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Blog</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage blog posts and articles.
            </p>
          </div>
          {view === "list" && (
            <Button onClick={handleNew} className="gap-2">
              <Plus className="h-4 w-4" />
              New Post
            </Button>
          )}
        </div>
      </motion.div>

      {view === "list" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05, ease: easing }}
        >
          {posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
              <FileText className="h-12 w-12 mb-4 opacity-40" />
              <p>No blog posts yet.</p>
              <Button onClick={handleNew} className="mt-4 gap-2">
                <Plus className="h-4 w-4" />
                Create First Post
              </Button>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-border">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/20">
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Title</th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Author</th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Published</th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map((post) => (
                    <tr key={post.id} className="border-b border-border/50 transition-colors hover:bg-muted/10">
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground">{post.title}</p>
                        <p className="text-xs text-muted-foreground">/{post.slug}</p>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={post.status === "published" ? "default" : "secondary"} className="text-[10px]">
                          {post.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {post.author.fullName ?? "Unknown"}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {post.publishedAt ? format(new Date(post.publishedAt), "MMM d, yyyy") : "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(post)}>
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => window.open(`/blog/${post.slug}`, "_blank")}>
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(post.slug, post.title)}>
                            <Trash2 className="h-3.5 w-3.5 text-red-400" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      )}

      {view === "edit" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: easing }}
          className="space-y-4"
        >
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => setView("list")} className="gap-1">
              <X className="h-4 w-4" />
              Cancel
            </Button>
            <h2 className="text-lg font-semibold text-foreground">
              {editingPost ? "Edit Post" : "New Post"}
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Title</label>
              <Input
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Post title..."
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Slug</label>
              <Input
                value={formData.slug}
                onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                placeholder="post-url-slug"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Excerpt</label>
            <Textarea
              value={formData.excerpt}
              onChange={(e) => setFormData((prev) => ({ ...prev, excerpt: e.target.value }))}
              placeholder="Brief summary..."
              rows={2}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Cover Image URL</label>
            <Input
              value={formData.coverImage}
              onChange={(e) => setFormData((prev) => ({ ...prev, coverImage: e.target.value }))}
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Content</label>
            <Textarea
              value={formData.content}
              onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
              placeholder="Write your post content..."
              rows={12}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-foreground">Status:</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value as "draft" | "published" }))}
                className="rounded-lg border border-border bg-[rgba(255,255,255,0.02)] px-3 py-1.5 text-sm text-foreground"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setView("list")}>Cancel</Button>
              <Button onClick={handleSave} disabled={isSaving || !formData.title || !formData.slug || !formData.content} className="gap-2">
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {isSaving ? "Saving..." : "Save Post"}
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
