import { NextResponse } from "next/server";
import { z } from "zod";
import { getUser } from "@/lib/auth";
import { blockDefinitions } from "@/lib/block-definitions";

const updateBlockSchema = z.object({
  settings: z.record(z.string(), z.unknown()).optional(),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const block = blockDefinitions.find((b) => b.id === id);

  if (!block) {
    return NextResponse.json({ error: "Block type not found" }, { status: 404 });
  }

  return NextResponse.json(block);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const block = blockDefinitions.find((b) => b.id === id);

  if (!block) {
    return NextResponse.json({ error: "Block type not found" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = updateBlockSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  return NextResponse.json({ ...block, ...parsed.data });
}
