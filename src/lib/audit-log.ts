import { prisma } from "@/lib/db";
import { dispatchWebhooks } from "@/lib/webhook";

export type AuditAction = "create" | "update" | "delete" | "publish" | "restore" | "permission_change" | "theme_change";

function actionToEvent(action: AuditAction, resource: string): string {
  const mapping: Partial<Record<AuditAction, string>> = {
    create: `${resource}.created`,
    update: `${resource}.updated`,
    delete: `${resource}.deleted`,
    publish: `page.published`,
    permission_change: `role.changed`,
    theme_change: `theme.created`,
  };
  return mapping[action] ?? `${resource}.${action}`;
}

export async function createAuditLog(params: {
  action: AuditAction;
  resource: string;
  resourceId?: string;
  userId?: string;
  details?: Record<string, unknown>;
}) {
  const entry = await prisma.auditLog.create({
    data: {
      action: params.action,
      resource: params.resource,
      resourceId: params.resourceId ?? null,
      userId: params.userId ?? null,
      details: JSON.stringify(params.details ?? {}),
    },
  });

  dispatchWebhooks({
    event: actionToEvent(params.action, params.resource),
    resource: params.resource,
    resourceId: params.resourceId ?? "",
    userId: params.userId ?? null,
    details: params.details ?? null,
    timestamp: new Date().toISOString(),
  }).catch(() => {});

  return entry;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  resource: string;
  resourceId: string | null;
  userId: string | null;
  details: string;
  createdAt: Date;
}

export async function getAuditLogs(options?: {
  action?: string;
  resource?: string;
  limit?: number;
  offset?: number;
}): Promise<AuditLogEntry[]> {
  const where: Record<string, unknown> = {};
  if (options?.action) where.action = options.action;
  if (options?.resource) where.resource = options.resource;

  return prisma.auditLog.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: options?.limit ?? 50,
    skip: options?.offset ?? 0,
  });
}

export async function getAuditLogCount(options?: {
  action?: string;
  resource?: string;
}): Promise<number> {
  const where: Record<string, unknown> = {};
  if (options?.action) where.action = options.action;
  if (options?.resource) where.resource = options.resource;

  return prisma.auditLog.count({ where });
}
