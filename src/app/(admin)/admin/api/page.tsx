"use client";

import { useState, useEffect, useCallback } from "react";
import { Key, Plus, Trash2, Copy, Check, Loader2, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ApiKeyRecord {
  id: string;
  name: string;
  prefix: string;
  lastChars: string;
  role: string;
  active: boolean;
  lastUsedAt: string | null;
  createdAt: string;
}

export default function AdminApiPage() {
  const [keys, setKeys] = useState<ApiKeyRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("admin");
  const [creating, setCreating] = useState(false);
  const [rawKey, setRawKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchKeys = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/api-keys");
      if (!res.ok) throw new Error("Failed to load API keys");
      setKeys(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  async function handleCreate() {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/admin/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim(), role: newRole }),
      });
      if (!res.ok) throw new Error("Failed to create key");
      const data = await res.json();
      setRawKey(data.rawKey);
      setNewName("");
      setShowCreate(false);
      await fetchKeys();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to create");
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this API key? This cannot be undone.")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/api-keys/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setKeys((prev) => prev.filter((k) => k.id !== id));
    } catch {
      alert("Failed to delete");
    } finally {
      setDeleting(null);
    }
  }

  function handleCopy() {
    if (rawKey) {
      navigator.clipboard.writeText(rawKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (isLoading) return <LoadingScreen fullScreen={false} message="Loading API keys..." />;

  if (error) return <ErrorState message={error} onRetry={fetchKeys} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">API Keys</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage API keys for external integrations.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchKeys}>
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
            Refresh
          </Button>
          <Button size="sm" onClick={() => { setShowCreate(!showCreate); setRawKey(null); }}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            New Key
          </Button>
        </div>
      </div>

      {showCreate && (
        <div className="rounded-xl border border-border bg-muted/10 p-4">
          <div className="flex items-end gap-3">
            <div className="flex-1 space-y-1.5">
              <label className="text-xs text-muted-foreground">Key Name</label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Integration name..."
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Role</label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="teacher">Teacher</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleCreate} disabled={creating || !newName.trim()}>
              {creating ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : null}
              Generate
            </Button>
          </div>
        </div>
      )}

      {rawKey && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
          <p className="mb-2 text-xs font-semibold text-emerald-400">
            Key generated — copy it now. You won&apos;t see it again.
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded-lg bg-muted/30 px-3 py-2 text-xs font-mono text-foreground break-all">
              {rawKey}
            </code>
            <Button size="sm" variant="outline" onClick={handleCopy}>
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            </Button>
          </div>
        </div>
      )}

      {keys.length === 0 && !rawKey ? (
        <EmptyState
          icon={Key}
          title="No API keys"
          description="Create your first API key for external integrations."
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/20">
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Name</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Key</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Role</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Last Used</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Created</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {keys.map((apiKey) => (
                <tr key={apiKey.id} className="border-b border-border/50 transition-colors hover:bg-muted/10">
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium text-foreground">{apiKey.name}</span>
                  </td>
                  <td className="px-4 py-3">
                    <code className="rounded bg-muted/30 px-2 py-0.5 text-[10px] font-mono text-muted-foreground">
                      {apiKey.prefix}...{apiKey.lastChars}
                    </code>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-muted-foreground capitalize">{apiKey.role}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      apiKey.active ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                    }`}>
                      {apiKey.active ? "Active" : "Revoked"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[11px] text-muted-foreground">
                    {apiKey.lastUsedAt ? new Date(apiKey.lastUsedAt).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-3 text-[11px] text-muted-foreground whitespace-nowrap">
                    {new Date(apiKey.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDelete(apiKey.id)}
                      disabled={deleting === apiKey.id}
                      className="rounded-lg p-1.5 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Delete key"
                    >
                      {deleting === apiKey.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
