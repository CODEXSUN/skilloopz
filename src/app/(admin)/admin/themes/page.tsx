"use client";

import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Palette, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { ThemeCard } from "@/components/admin/themes/theme-card";

interface ThemeRecord {
  id: string;
  name: string;
  isActive: boolean;
  tokens: string;
}

export default function AdminThemesPage() {
  const queryClient = useQueryClient();
  const [themes, setThemes] = useState<ThemeRecord[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    fetch("/api/admin/themes")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load themes");
        return res.json();
      })
      .then((data) => {
        setThemes(data);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setIsLoading(false);
      });
  }, []);

  async function handleCreate() {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/admin/themes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });
      if (!res.ok) throw new Error("Failed to create theme");
      const theme = await res.json();
      setThemes((prev) => (prev ? [theme, ...prev] : [theme]));
      setShowCreate(false);
      setNewName("");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to create theme");
    } finally {
      setCreating(false);
    }
  }

  async function handleActivate(id: string) {
    try {
      await fetch("/api/admin/themes/active", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setThemes((prev) =>
        prev?.map((t) => ({ ...t, isActive: t.id === id })) ?? null,
      );
      queryClient.invalidateQueries({ queryKey: ["activeTheme"] });
    } catch {
      alert("Failed to activate theme");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this theme?")) return;
    try {
      await fetch(`/api/admin/themes/${id}`, { method: "DELETE" });
      setThemes((prev) => prev?.filter((t) => t.id !== id) ?? null);
    } catch {
      alert("Failed to delete theme");
    }
  }

  if (isLoading) return <LoadingScreen fullScreen={false} message="Loading themes..." />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Themes</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage visual themes for the platform.
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4" />
          New Theme
        </Button>
      </div>

      {!themes || themes.length === 0 ? (
        <EmptyState
          icon={Palette}
          title="No themes yet"
          description="Create your first theme to customize the look."
          actionLabel="Create Theme"
          onAction={() => setShowCreate(true)}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {themes.map((theme) => (
            <ThemeCard
              key={theme.id}
              id={theme.id}
              name={theme.name}
              isActive={theme.isActive}
              tokens={theme.tokens}
              onActivate={handleActivate}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Theme</DialogTitle>
            <DialogDescription>
              Create a new visual theme.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-sm font-medium">Theme Name</label>
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="My Theme"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreate();
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={creating || !newName.trim()}>
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
