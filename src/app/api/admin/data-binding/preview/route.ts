import { NextResponse } from "next/server";
import { z } from "zod";
import { getUser } from "@/lib/auth";
import { resolveDataSource, type DataSourceType } from "@/lib/data-binding";

const previewSchema = z.object({
  type: z.enum(["courses", "users", "categories", "enrollments", "lessons", "analytics"]),
  filters: z.record(z.string(), z.unknown()).optional().default({}),
  limit: z.number().int().positive().optional(),
});

export async function POST(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const parsed = previewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  try {
    const data = await resolveDataSource({
      type: parsed.data.type as DataSourceType,
      filters: parsed.data.filters,
      limit: parsed.data.limit,
    });
    return NextResponse.json({ data });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to resolve data source" },
      { status: 500 },
    );
  }
}
