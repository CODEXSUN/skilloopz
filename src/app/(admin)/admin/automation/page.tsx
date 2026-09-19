import { prisma } from "@/lib/db";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function AdminAutomationPage() {
  const settings = await prisma.platformSetting.findMany({
    where: { group: "automation" },
  });

  const values: Record<string, string> = {};
  for (const s of settings) {
    values[s.key] = s.value;
  }

  const items = [
    {
      key: "backup_enabled",
      label: "Scheduled Backups",
      value: values["backup_enabled"] ?? "enabled",
      description: "Automated database and file backups",
    },
    {
      key: "backup_frequency",
      label: "Backup Frequency",
      value: values["backup_frequency"] ?? "daily",
      description: "How often backups are created",
    },
    {
      key: "backup_retention_days",
      label: "Backup Retention",
      value: values["backup_retention_days"] ?? "30",
      description: "Number of days to retain backups",
    },
    {
      key: "auto_archive_enabled",
      label: "Auto-Archive Rules",
      value: values["auto_archive_enabled"] ?? "disabled",
      description: "Automatically archive inactive courses",
    },
    {
      key: "auto_archive_days",
      label: "Archive After (Days)",
      value: values["auto_archive_days"] ?? "180",
      description: "Days of inactivity before auto-archive",
    },
    {
      key: "cleanup_temp_files",
      label: "Temp File Cleanup",
      value: values["cleanup_temp_files"] ?? "enabled",
      description: "Automatic cleanup of temporary uploads",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Automation</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Automation rules, scheduled tasks, and trigger settings.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {items.map((item) => (
          <Card key={item.key}>
            <CardHeader>
              <CardTitle className="text-base">{item.label}</CardTitle>
              <CardDescription>{item.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Badge variant={item.value === "enabled" ? "default" : "secondary"}>
                {item.value}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
