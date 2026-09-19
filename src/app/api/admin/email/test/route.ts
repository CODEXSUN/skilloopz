import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { sendEmail } from "@/lib/email";
import { createAuditLog } from "@/lib/audit-log";

export async function POST(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { to } = body;

  if (!to || typeof to !== "string" || !to.includes("@")) {
    return NextResponse.json({ error: "Valid email address required" }, { status: 400 });
  }

  const result = await sendEmail(
    to,
    "NEOT — Test Email",
    `<h1>Test Email</h1><p>This is a test email from your NEOT platform. If you received this, your email integration is working correctly.</p>`,
  );

  await createAuditLog({
    action: "update",
    resource: "settings",
    userId: user.id,
    details: { to, success: result.success },
  });

  if (!result.success) {
    return NextResponse.json({ error: result.error || "Failed to send" }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: "Test email sent" });
}
