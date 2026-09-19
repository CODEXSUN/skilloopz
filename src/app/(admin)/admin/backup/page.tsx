import { BackupControls } from "@/components/admin/backup/backup-controls";

export default function AdminBackupPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Backup</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Export your platform data and database.
        </p>
      </div>
      <BackupControls />
    </div>
  );
}
