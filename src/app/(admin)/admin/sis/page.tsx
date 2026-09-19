"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Database, Loader2, Trash2, RefreshCw, Check, X, Upload, FileText, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { ErrorState } from "@/components/ui/error-state";

interface SisConfig {
  id: string;
  name: string;
  provider: string;
  apiUrl: string | null;
  apiKey: string | null;
  csvMapping: string;
  schoolId: string | null;
  enabled: boolean;
  createdAt: string;
}

interface SyncLog {
  id: string;
  configId: string;
  status: string;
  recordsSynced: number;
  recordsFailed: number;
  errors: string;
  summary: string;
  createdAt: string;
  completedAt: string | null;
}

const PROVIDERS = [
  { value: "csv", label: "CSV Import" },
  { value: "powerschool", label: "PowerSchool" },
  { value: "infinitecampus", label: "Infinite Campus" },
  { value: "custom", label: "Custom API" },
];

export default function AdminSisPage() {
  const [configs, setConfigs] = useState<SisConfig[]>([]);
  const [logs, setLogs] = useState<SyncLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<string>("");
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: "",
    provider: "csv",
    apiUrl: "",
    apiKey: "",
    schoolId: "",
    enabled: true,
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setIsLoading(true);
    setError(null);
    try {
      const [configsRes, logsRes] = await Promise.all([
        fetch("/api/admin/sis"),
        fetch("/api/admin/sis/logs?limit=10"),
      ]);
      if (!configsRes.ok) throw new Error("Failed to load configs");
      setConfigs(await configsRes.json());
      if (logsRes.ok) setLogs(await logsRes.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setIsLoading(false);
    }
  }

  function resetForm() {
    setForm({ name: "", provider: "csv", apiUrl: "", apiKey: "", schoolId: "", enabled: true });
    setEditingId(null);
    setShowForm(false);
  }

  function startEdit(config: SisConfig) {
    setForm({
      name: config.name,
      provider: config.provider,
      apiUrl: config.apiUrl || "",
      apiKey: config.apiKey || "",
      schoolId: config.schoolId || "",
      enabled: config.enabled,
    });
    setEditingId(config.id);
    setShowForm(true);
  }

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    try {
      const url = editingId ? `/api/admin/sis/${editingId}` : "/api/admin/sis";
      const method = editingId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }
      setMessage(editingId ? "Config updated" : "Config created");
      resetForm();
      await fetchData();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this SIS config?")) return;
    try {
      const res = await fetch(`/api/admin/sis/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      await fetchData();
      setMessage("Config deleted");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to delete");
    }
  }

  async function handleToggle(id: string, enabled: boolean) {
    try {
      await fetch(`/api/admin/sis/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled }),
      });
      await fetchData();
    } catch {
      // ignore
    }
  }

  async function handleSync() {
    if (!selectedConfig || !csvFile) return;
    setSyncing(true);
    setMessage(null);
    try {
      const formData = new FormData();
      formData.append("configId", selectedConfig);
      formData.append("file", csvFile);
      const res = await fetch("/api/admin/sis/sync", { method: "POST", body: formData });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Sync failed");
      }
      const data = await res.json();
      setMessage(`Sync complete: ${data.synced} synced, ${data.failed} failed`);
      setCsvFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      await fetchData();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Sync failed");
    } finally {
      setSyncing(false);
    }
  }

  if (isLoading) return <LoadingScreen fullScreen={false} message="Loading SIS configs..." />;
  if (error) return <ErrorState message={error} onRetry={fetchData} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">SIS Integration</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sync student data from PowerSchool, Infinite Campus, or CSV files.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
            Refresh
          </Button>
          <Button size="sm" onClick={() => { resetForm(); setShowForm(true); }}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Add Config
          </Button>
        </div>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              {editingId ? "Edit SIS Config" : "New SIS Config"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">Name</label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. PowerSchool Prod" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">Provider</label>
                <select
                  value={form.provider}
                  onChange={(e) => setForm({ ...form, provider: e.target.value })}
                  className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {PROVIDERS.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {form.provider !== "csv" && (
              <>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-foreground">API URL</label>
                  <Input value={form.apiUrl} onChange={(e) => setForm({ ...form, apiUrl: e.target.value })} placeholder="https://sis.example.com/api/v1" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-foreground">API Key</label>
                  <Input value={form.apiKey} onChange={(e) => setForm({ ...form, apiKey: e.target.value })} type="password" placeholder="API key" />
                </div>
              </>
            )}

            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground">School ID <span className="text-muted-foreground">(optional)</span></label>
              <Input value={form.schoolId} onChange={(e) => setForm({ ...form, schoolId: e.target.value })} placeholder="Assign synced users to this school" />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div>
                <p className="text-sm font-medium text-foreground">Enabled</p>
                <p className="text-xs text-muted-foreground">Allow sync from this source</p>
              </div>
              <Switch checked={form.enabled} onCheckedChange={(v) => setForm({ ...form, enabled: v })} />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={saving || !form.name}>
                {saving ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Check className="mr-1.5 h-3.5 w-3.5" />}
                {editingId ? "Update" : "Create"}
              </Button>
              <Button variant="outline" onClick={resetForm}>
                <X className="mr-1.5 h-3.5 w-3.5" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>CSV Upload & Sync</CardTitle>
          <CardDescription>
            Upload a CSV file to sync student/teacher data. Expected columns: email, first_name, last_name, external_id, role, grade.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground">SIS Config</label>
              <select
                value={selectedConfig}
                onChange={(e) => setSelectedConfig(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select a config...</option>
                {configs.filter((c) => c.enabled).map((c) => (
                  <option key={c.id} value={c.id}>{c.name} ({c.provider})</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground">CSV File</label>
              <div className="flex items-center gap-2">
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                  className="flex-1"
                />
                {csvFile && (
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{csvFile.name}</span>
                )}
              </div>
            </div>
          </div>
          <Button onClick={handleSync} disabled={syncing || !selectedConfig || !csvFile}>
            {syncing ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Upload className="mr-1.5 h-3.5 w-3.5" />
            )}
            Upload & Sync
          </Button>
        </CardContent>
      </Card>

      {message && (
        <div className={`rounded-lg border p-3 text-center text-sm ${
          message.includes("failed") || message.includes("Failed")
            ? "border-red-500/20 bg-red-500/5 text-red-400"
            : "border-emerald-500/20 bg-emerald-500/5 text-emerald-400"
        }`}>
          {message}
        </div>
      )}

      <div className="space-y-3">
        {configs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Database className="mb-4 h-12 w-12 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No SIS configs configured yet.</p>
              <p className="text-xs text-muted-foreground">Add a config to start syncing student data.</p>
            </CardContent>
          </Card>
        ) : (
          configs.map((config) => (
            <Card key={config.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border bg-muted text-sm font-bold text-muted-foreground">
                    {config.name[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{config.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="capitalize">{config.provider}</span>
                      <span>·</span>
                      <span className={config.enabled ? "text-emerald-400" : "text-red-400"}>
                        {config.enabled ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={config.enabled} onCheckedChange={(v) => handleToggle(config.id, v)} />
                  <Button variant="ghost" size="icon" onClick={() => startEdit(config)}>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(config.id)}>
                    <Trash2 className="h-4 w-4 text-red-400" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {logs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Sync History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {logs.map((log) => (
                <div key={log.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div className="flex items-center gap-3">
                    {log.status === "completed" ? (
                      <Check className="h-4 w-4 text-emerald-400" />
                    ) : log.status === "failed" ? (
                      <AlertCircle className="h-4 w-4 text-red-400" />
                    ) : (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-foreground capitalize">{log.status.replace(/_/g, " ")}</p>
                      <p className="text-xs text-muted-foreground">
                        {log.recordsSynced} synced · {log.recordsFailed} failed · {new Date(log.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {log.errors && log.errors !== "[]" && (
                    <span className="text-xs text-red-400">{JSON.parse(log.errors).length} errors</span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
