"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, Loader2, Shield } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
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

interface Role {
  id: string;
  name: string;
  description: string | null;
  permissions: string;
  isBuiltIn: boolean;
  createdAt: string;
  updatedAt: string;
}

const PERMISSION_KEYS = [
  "users",
  "courses",
  "pages",
  "settings",
  "roles",
  "analytics",
  "templates",
  "navigation",
  "media",
  "backups",
  "moderation",
  "notifications",
  "automation",
  "localization",
] as const;

const PERMISSION_ACTIONS = ["create", "read", "update", "delete"] as const;

type Permissions = Record<string, Record<string, boolean>>;

function parsePermissions(raw: string): Permissions {
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function defaultPermissions(): Permissions {
  const perms: Permissions = {};
  for (const key of PERMISSION_KEYS) {
    perms[key] = {};
    for (const action of PERMISSION_ACTIONS) {
      perms[key][action] = false;
    }
  }
  return perms;
}

export default function AdminRolesPage() {
  const [roles, setRoles] = useState<Role[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [permissions, setPermissions] = useState<Permissions>({});

  useEffect(() => {
    fetch("/api/admin/roles")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load roles");
        return res.json();
      })
      .then((data: Role[]) => {
        setRoles(data);
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
    setDescription("");
    setPermissions(defaultPermissions());
    setShowDialog(true);
  }

  function openEdit(role: Role) {
    setEditingId(role.id);
    setName(role.name);
    setDescription(role.description ?? "");
    setPermissions(parsePermissions(role.permissions));
    setShowDialog(true);
  }

  const togglePermission = useCallback(
    (resource: string, action: string, value: boolean) => {
      setPermissions((prev) => ({
        ...prev,
        [resource]: { ...(prev[resource] ?? {}), [action]: value },
      }));
    },
    [],
  );

  async function handleSave() {
    setSaving(true);
    try {
      const url = editingId
        ? `/api/admin/roles/${editingId}`
        : "/api/admin/roles";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name || undefined,
          description: description || null,
          permissions: JSON.stringify(permissions),
        }),
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
      const refreshed = await fetch("/api/admin/roles");
      setRoles(await refreshed.json());
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save role");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(role: Role) {
    if (!confirm(`Delete role "${role.name}"? This cannot be undone.`)) return;
    setDeleting(role.id);
    try {
      const res = await fetch(`/api/admin/roles/${role.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to delete role");
      }
      setRoles((prev) => prev?.filter((r) => r.id !== role.id) ?? null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete role");
    } finally {
      setDeleting(null);
    }
  }

  if (isLoading)
    return <LoadingScreen fullScreen={false} message="Loading roles..." />;

  if (error) return <ErrorState message={error} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Roles</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage user roles and permissions.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Add Role
        </Button>
      </div>

      {!roles || roles.length === 0 ? (
        <EmptyState
          icon={Shield}
          title="No roles yet"
          description="Create your first role to define permissions."
          actionLabel="Add Role"
          onAction={openCreate}
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted">
              <tr>
                <th className="px-4 py-3 font-medium text-muted-foreground">Name</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Description</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Permissions</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Built-in</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {roles.map((role) => {
                const perms = parsePermissions(role.permissions);
                const enabledCount = Object.values(perms).reduce(
                  (sum, actions) =>
                    sum + Object.values(actions).filter(Boolean).length,
                  0,
                );
                return (
                  <tr
                    key={role.id}
                    className="group transition-colors hover:bg-muted/50"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-foreground capitalize">
                          {role.name}
                        </span>
                      </div>
                    </td>
                    <td className="max-w-xs truncate px-4 py-3 text-muted-foreground">
                      {role.description ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {enabledCount} enabled
                    </td>
                    <td className="px-4 py-3">
                      {role.isBuiltIn ? (
                        <Badge variant="secondary" className="text-xs">Built-in</Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEdit(role)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-all hover:bg-blue-500/10 hover:text-blue-400"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(role)}
                          disabled={deleting === role.id}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-all hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
                          title="Delete"
                        >
                          {deleting === role.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Role" : "Add Role"}</DialogTitle>
            <DialogDescription>
              {editingId
                ? "Update the role name, description, and permissions."
                : "Create a new role with custom permissions."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="editor"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Can edit content but not manage settings"
                rows={2}
              />
            </div>

            <div className="space-y-3">
              <Label>Permissions</Label>
              <div className="space-y-2">
                {PERMISSION_KEYS.map((resource) => {
                  const resourcePerms = permissions[resource] ?? {};
                  const allOn = PERMISSION_ACTIONS.every(
                    (a) => resourcePerms[a],
                  );
                  return (
                    <div
                      key={resource}
                      className="rounded-lg border border-border bg-[rgba(255,255,255,0.02)] p-3"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground capitalize">
                          {resource.replace(/_/g, " ")}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const next = !allOn;
                            for (const action of PERMISSION_ACTIONS) {
                              togglePermission(resource, action, next);
                            }
                          }}
                          className="text-xs text-muted-foreground hover:text-primary-400 transition-colors"
                        >
                          {allOn ? "Clear all" : "Select all"}
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {PERMISSION_ACTIONS.map((action) => (
                          <label
                            key={action}
                            className="flex items-center gap-1.5 cursor-pointer"
                          >
                            <Switch
                              checked={resourcePerms[action] ?? false}
                              onCheckedChange={(checked) =>
                                togglePermission(resource, action, checked)
                              }
                            />
                            <span className="text-xs text-muted-foreground capitalize">
                              {action}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
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
