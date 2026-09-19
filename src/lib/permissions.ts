import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { ensureDefaultRoles } from "@/lib/roles";

type PermissionAction = "create" | "read" | "update" | "delete";
type PermissionResource =
  | "users"
  | "courses"
  | "pages"
  | "settings"
  | "roles"
  | "analytics"
  | "templates"
  | "navigation"
  | "media"
  | "backups"
  | "moderation"
  | "notifications"
  | "automation"
  | "localization";

export async function checkPermission(
  role: string,
  resource: PermissionResource,
  action: PermissionAction,
): Promise<boolean> {
  try {
    await ensureDefaultRoles();
    const roleDoc = await prisma.role.findUnique({ where: { name: role } });
    if (!roleDoc) return false;

    const permissions = JSON.parse(roleDoc.permissions) as Record<string, Record<string, boolean>>;
    return permissions[resource]?.[action] === true;
  } catch {
    return false;
  }
}

export async function requirePermission(
  role: string | undefined | null,
  resource: PermissionResource,
  action: PermissionAction,
): Promise<ReturnType<typeof NextResponse.json> | null> {
  if (!role) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const allowed = await checkPermission(role, resource, action);
  if (!allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return null;
}
