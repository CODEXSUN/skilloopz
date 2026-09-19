import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { createSisSyncLog, updateSisSyncLog, getSisConfig, processCsvUpload } from "@/lib/sis";
import { createAuditLog } from "@/lib/audit-log";

export async function POST(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const formData = await request.formData();
  const configId = formData.get("configId") as string;
  const file = formData.get("file") as File;
  const mappingStr = formData.get("mapping") as string;

  if (!configId) {
    return NextResponse.json({ error: "Config ID required" }, { status: 400 });
  }

  const config = await getSisConfig(configId);
  if (!config) {
    return NextResponse.json({ error: "Config not found" }, { status: 404 });
  }

  const logId = await createSisSyncLog(configId);

  try {
    let result: { synced: number; failed: number; errors: string[] };

    if (file) {
      const csvContent = await file.text();
      const mapping = mappingStr ? JSON.parse(mappingStr) : {
        email: "email",
        firstName: "first_name",
        lastName: "last_name",
        externalId: "external_id",
        role: "role",
        grade: "grade",
      };
      result = await processCsvUpload(csvContent, mapping, config.schoolId);
    } else {
      return NextResponse.json({ error: "CSV file required" }, { status: 400 });
    }

    await updateSisSyncLog(logId, {
      status: result.failed > 0 ? "completed_with_errors" : "completed",
      recordsSynced: result.synced,
      recordsFailed: result.failed,
      errors: JSON.stringify(result.errors.slice(0, 50)),
      summary: JSON.stringify({ provider: config.provider, source: "csv" }),
    });

    await createAuditLog({
      action: "update",
      resource: "sis",
      resourceId: configId,
      userId: user.id,
      details: { sync: { synced: result.synced, failed: result.failed } },
    });

    return NextResponse.json({
      success: true,
      synced: result.synced,
      failed: result.failed,
      errors: result.errors.slice(0, 10),
    });
  } catch (err) {
    await updateSisSyncLog(logId, {
      status: "failed",
      errors: JSON.stringify([err instanceof Error ? err.message : "Unknown error"]),
    });
    return NextResponse.json({ error: err instanceof Error ? err.message : "Sync failed" }, { status: 500 });
  }
}
