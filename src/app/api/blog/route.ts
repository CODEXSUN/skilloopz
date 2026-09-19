import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getUser } from "@/lib/auth";

const createBlogSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  excerpt: z.string().optional(),
  content: z.string().min(1),
  coverImage: z.string().optional(),
  status: z.enum(["draft", "published"]).optional().default("draft"),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const authorId = searchParams.get("authorId");

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  else where.status = "published";
  if (authorId) where.authorId = authorId;

  const posts = await prisma.blogPost.findMany({
    where,
    include: {
      author: { select: { id: true, fullName: true, avatarUrl: true } },
    },
    orderBy: { publishedAt: "desc" },
    take: 50,
  });

  return NextResponse.json(posts, {
    headers: { "Cache-Control": "public, max-age=300, s-maxage=600" },
  });
}

export async function POST(request: Request) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createBlogSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const existing = await prisma.blogPost.findUnique({
    where: { slug: parsed.data.slug },
  });
  if (existing) {
    return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
  }

  const post = await prisma.blogPost.create({
    data: {
      ...parsed.data,
      authorId: user.id,
      publishedAt: parsed.data.status === "published" ? new Date() : null,
    },
    include: {
      author: { select: { id: true, fullName: true, avatarUrl: true } },
    },
  });

  return NextResponse.json(post, { status: 201 });
}
