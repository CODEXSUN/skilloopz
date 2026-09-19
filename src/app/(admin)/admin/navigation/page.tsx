"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, GripVertical, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: string | null;
  role: string;
  parentId: string | null;
  sortOrder: number;
  isVisible: boolean;
  createdAt: string;
}

interface NavItemForm {
  label: string;
  href: string;
  icon: string;
  role: string;
  sortOrder: number;
  isVisible: boolean;
}

const defaultForm: NavItemForm = {
  label: "",
  href: "",
  icon: "",
  role: "all",
  sortOrder: 0,
  isVisible: true,
};

const roles = ["all", "student", "teacher", "parent", "admin"];

export default function AdminNavigationPage() {
  const [items, setItems] = useState<NavItem[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [form, setForm] = useState<NavItemForm>(defaultForm);

  useEffect(() => {
    fetch("/api/admin/navigation")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load navigation");
        return res.json();
      })
      .then((data: Record<string, NavItem[]>) => {
        const all = Object.values(data).flat();
        setItems(all);
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

  function openEdit(item: NavItem) {
    setEditingId(item.id);
    setForm({
      label: item.label,
      href: item.href,
      icon: item.icon ?? "",
      role: item.role,
      sortOrder: item.sortOrder,
      isVisible: item.isVisible,
    });
    setShowDialog(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/navigation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingId ? { ...form, id: editingId } : form),
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
      const refreshed = await fetch("/api/admin/navigation");
      const data: Record<string, NavItem[]> = await refreshed.json();
      setItems(Object.values(data).flat());
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save nav item");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string, label: string) {
    if (!confirm(`Delete nav item "${label}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/navigation?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete nav item");
      setItems((prev) => prev?.filter((i) => i.id !== id) ?? null);
    } catch {
      alert("Failed to delete nav item");
    } finally {
      setDeleting(null);
    }
  }

  if (isLoading)
    return <LoadingScreen fullScreen={false} message="Loading navigation..." />;

  if (error) return <ErrorState message={error} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Navigation</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage navigation items across all roles.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Add Item
        </Button>
      </div>

      {!items || items.length === 0 ? (
        <EmptyState
          icon={GripVertical}
          title="No navigation items yet"
          description="Create your first navigation item to build menus."
          actionLabel="Add Item"
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
                <th className="px-4 py-3 font-medium text-muted-foreground">Label</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Href</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Icon</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Role</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Visible</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((item) => (
                <tr
                  key={item.id}
                  className="group transition-colors hover:bg-muted/50"
                >
                  <td className="px-4 py-3 text-muted-foreground">
                    {item.sortOrder}
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground">
                    {item.label}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                    {item.href}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                    {item.icon ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-full bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-400">
                      {item.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        item.isVisible
                          ? "bg-green-500/10 text-green-400"
                          : "bg-red-500/10 text-red-400"
                      }`}
                    >
                      {item.isVisible ? "Yes" : "No"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEdit(item)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-all hover:bg-blue-500/10 hover:text-blue-400"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, item.label)}
                        disabled={deleting === item.id}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-all hover:bg-red-500/10 hover:text-red-400"
                        title="Delete"
                      >
                        {deleting === item.id ? (
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
            <DialogTitle>{editingId ? "Edit Nav Item" : "Add Nav Item"}</DialogTitle>
            <DialogDescription>
              {editingId
                ? "Update the navigation item details."
                : "Create a new navigation item."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="label">Label</Label>
              <Input
                id="label"
                value={form.label}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, label: e.target.value }))
                }
                placeholder="Dashboard"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="href">Href</Label>
              <Input
                id="href"
                value={form.href}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, href: e.target.value }))
                }
                placeholder="/dashboard"
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
                placeholder="LayoutDashboard"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={form.role}
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, role: value }))
                }
              >
                <SelectTrigger id="role" className="w-full">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

            <div className="flex items-center gap-3">
              <Switch
                id="isVisible"
                checked={form.isVisible}
                onCheckedChange={(checked) =>
                  setForm((prev) => ({ ...prev, isVisible: checked }))
                }
              />
              <Label htmlFor="isVisible">Visible</Label>
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
              disabled={saving || !form.label || !form.href}
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
