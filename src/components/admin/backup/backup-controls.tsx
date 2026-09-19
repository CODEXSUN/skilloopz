"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Database,
  Download,
  FileJson,
  Loader2,
  Save,
  RefreshCw,
  Clock,
  Trash2,
  RotateCcw,
  History,
  Settings2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { EmptyState } from "@/components/ui/empty-state";

interface BackupRecord {
  id: string;
  filename: string;
  sizeBytes: number;
  status: string;
  type: string;
  notes: string | null;
  filePath: string;
  createdAt: string;
}

interface BackupSettings {
  autoBackupEnabled: boolean;
  autoBackupFrequency: string;
  backupRetentionDays: number;
  backupTime: string;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function BackupControls() {
  const [dbInfo, setDbInfo] = useState<{ sizeBytes: number; lastModified: string } | null>(null);
  const [isLoadingInfo, setIsLoadingInfo] = useState(true);
  const [isExportingDb, setIsExportingDb] = useState(false);
  const [isExportingJson, setIsExportingJson] = useState(false);
  const [isTriggering, setIsTriggering] = useState(false);
  const [isRestoring, setIsRestoring] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [records, setRecords] = useState<BackupRecord[]>([]);
  const [recordsTotal, setRecordsTotal] = useState(0);
  const [totalSizeBytes, setTotalSizeBytes] = useState(0);
  const [isLoadingRecords, setIsLoadingRecords] = useState(true);

  const [settings, setSettings] = useState<BackupSettings | null>(null);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const fetchRecords = useCallback(async () => {
    setIsLoadingRecords(true);
    try {
      const res = await fetch("/api/admin/backup/records");
      if (res.ok) {
        const data = await res.json();
        setRecords(data.records);
        setRecordsTotal(data.total);
        setTotalSizeBytes(data.totalSizeBytes);
      }
    } catch {
      // silent
    } finally {
      setIsLoadingRecords(false);
    }
  }, []);

  const fetchSettings = useCallback(async () => {
    setIsLoadingSettings(true);
    try {
      const res = await fetch("/api/admin/backup/settings");
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch {
      // silent
    } finally {
      setIsLoadingSettings(false);
    }
  }, []);

  useEffect(() => {
    fetch("/api/admin/backup/info")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setDbInfo(data);
      })
      .catch(() => {})
      .finally(() => setIsLoadingInfo(false));

    fetchRecords();
    fetchSettings();
  }, [fetchRecords, fetchSettings]);

  async function handleExportDb() {
    setIsExportingDb(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/backup");
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `neot-backup-${new Date().toISOString().split("T")[0]}.db`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setMessage("Database exported successfully");
    } catch {
      setMessage("Failed to export database");
    } finally {
      setIsExportingDb(false);
    }
  }

  async function handleExportJson() {
    setIsExportingJson(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/backup?format=json");
      if (!res.ok) throw new Error("Export failed");
      const json = await res.json();
      const blob = new Blob([JSON.stringify(json, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `neot-export-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setMessage("Data exported successfully");
    } catch {
      setMessage("Failed to export data");
    } finally {
      setIsExportingJson(false);
    }
  }

  async function handleTriggerBackup() {
    setIsTriggering(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/backup/trigger", { method: "POST" });
      if (!res.ok) throw new Error("Backup failed");
      const data = await res.json();
      setMessage(`Backup created: ${data.record.filename}`);
      fetchRecords();
    } catch {
      setMessage("Failed to create backup");
    } finally {
      setIsTriggering(false);
    }
  }

  async function handleRestore(id: string) {
    if (!confirm("Restore will replace the current database. Continue?")) return;
    setIsRestoring(id);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/backup/records/${id}/restore`, { method: "POST" });
      if (!res.ok) throw new Error("Restore failed");
      const data = await res.json();
      setMessage(data.message);
    } catch {
      setMessage("Failed to restore backup");
    } finally {
      setIsRestoring(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this backup permanently?")) return;
    try {
      const res = await fetch("/api/admin/backup/records", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Delete failed");
      setRecords((prev) => prev.filter((r) => r.id !== id));
      setRecordsTotal((t) => t - 1);
    } catch {
      setMessage("Failed to delete backup");
    }
  }

  async function handleSaveSettings() {
    if (!settings) return;
    setIsSavingSettings(true);
    try {
      const res = await fetch("/api/admin/backup/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error("Failed to save settings");
      setMessage("Backup settings saved");
    } catch {
      setMessage("Failed to save settings");
    } finally {
      setIsSavingSettings(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              Database Export
            </CardTitle>
            <CardDescription>
              Download the current database file.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoadingInfo ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Checking database...
              </div>
            ) : dbInfo ? (
              <div className="space-y-1 text-sm">
                <p className="text-muted-foreground">
                  Size: <span className="font-medium text-foreground">{formatSize(dbInfo.sizeBytes)}</span>
                </p>
                <p className="text-muted-foreground">
                  Modified: <span className="font-medium text-foreground">
                    {new Date(dbInfo.lastModified).toLocaleString()}
                  </span>
                </p>
              </div>
            ) : null}
            <Button onClick={handleExportDb} disabled={isExportingDb} className="w-full">
              {isExportingDb ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              Export Database
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileJson className="h-5 w-5 text-primary" />
              Data Export (JSON)
            </CardTitle>
            <CardDescription>
              Export all platform data as JSON.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Exports users, courses, lessons, enrollments, settings, and more.
            </p>
            <Button onClick={handleExportJson} disabled={isExportingJson} variant="outline" className="w-full">
              {isExportingJson ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileJson className="h-4 w-4" />}
              Export Data (JSON)
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Save className="h-5 w-5 text-primary" />
              Create Backup
            </CardTitle>
            <CardDescription>
              Save a copy of the database on the server.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Creates a timestamped backup file in the backups directory.
            </p>
            <Button onClick={handleTriggerBackup} disabled={isTriggering} className="w-full">
              {isTriggering ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Create Backup Now
            </Button>
          </CardContent>
        </Card>
      </div>

      {records.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5 text-primary" />
                Backup History
              </CardTitle>
              <CardDescription>
                {recordsTotal} backups — {formatSize(totalSizeBytes)} total
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={fetchRecords} disabled={isLoadingRecords}>
              <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${isLoadingRecords ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/20">
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Filename</th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Size</th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Type</th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Date</th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record) => (
                    <tr key={record.id} className="border-b border-border/50 transition-colors hover:bg-muted/10">
                      <td className="max-w-xs truncate px-4 py-3 font-mono text-[12px] text-foreground">
                        {record.filename}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">
                        {formatSize(record.sizeBytes)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          record.type === "manual" ? "bg-blue-500/10 text-blue-400" : "bg-violet-500/10 text-violet-400"
                        }`}>
                          {record.type}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-[11px] text-muted-foreground">
                        {new Date(record.createdAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-amber-400 hover:text-amber-300"
                            title="Restore"
                            disabled={isRestoring === record.id}
                            onClick={() => handleRestore(record.id)}
                          >
                            {isRestoring === record.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <RotateCcw className="h-3.5 w-3.5" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-red-400 hover:text-red-300"
                            title="Delete"
                            onClick={() => handleDelete(record.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-primary" />
            Backup Schedule
          </CardTitle>
          <CardDescription>
            Configure automated backup settings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingSettings ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading settings...
            </div>
          ) : settings ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div>
                  <p className="text-sm font-medium text-foreground">Automatic Backups</p>
                  <p className="text-xs text-muted-foreground">Enable scheduled database backups</p>
                </div>
                <Switch
                  checked={settings.autoBackupEnabled}
                  onCheckedChange={(v) => setSettings({ ...settings, autoBackupEnabled: v })}
                />
              </div>
              {settings.autoBackupEnabled && (
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-foreground">Frequency</label>
                    <Select
                      value={settings.autoBackupFrequency}
                      onValueChange={(v) => setSettings({ ...settings, autoBackupFrequency: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-foreground">Backup Time</label>
                    <input
                      type="time"
                      value={settings.backupTime}
                      onChange={(e) => setSettings({ ...settings, backupTime: e.target.value })}
                      className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-foreground">Retention (days)</label>
                    <input
                      type="number"
                      min={1}
                      max={365}
                      value={settings.backupRetentionDays}
                      onChange={(e) => setSettings({ ...settings, backupRetentionDays: parseInt(e.target.value) || 30 })}
                      className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                  </div>
                </div>
              )}
              <Button onClick={handleSaveSettings} disabled={isSavingSettings}>
                {isSavingSettings ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Save className="mr-1.5 h-3.5 w-3.5" />}
                Save Settings
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {message && (
        <div className="rounded-lg border bg-muted/50 p-3 text-center text-sm text-muted-foreground">
          {message}
        </div>
      )}
    </div>
  );
}
