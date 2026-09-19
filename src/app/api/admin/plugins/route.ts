import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { getPlugins, createPlugin } from "@/lib/plugins";
import { createAuditLog } from "@/lib/audit-log";

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const plugins = await getPlugins();
  return NextResponse.json(plugins);
}

export async function POST(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { name, slug, description, author, version, config, hooks, webhookUrl, iconUrl } = body;

  if (!name || !slug || !description || !author) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const plugin = await createPlugin({ name, slug, description, author, version, config, hooks, webhookUrl, iconUrl });

  await createAuditLog({
    action: "create",
    resource: "plugin",
    resourceId: plugin.id,
    userId: user.id,
    details: { name, slug },
  });

  return NextResponse.json(plugin, { status: 201 });
}
