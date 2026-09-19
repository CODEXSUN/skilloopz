import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { blockDefinitions } from "@/lib/block-definitions";

export { blockDefinitions };

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  return NextResponse.json(blockDefinitions);
}
