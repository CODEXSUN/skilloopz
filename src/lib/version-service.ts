import { prisma } from "@/lib/db";

export interface VersionSnapshot {
  id: string;
  pageId: string;
  sections: string;
  createdAt: Date;
}

export async function createVersionSnapshot(pageId: string, versionTag?: string): Promise<VersionSnapshot> {
  const sections = await prisma.pageSection.findMany({
    where: { pageId },
    orderBy: { sortOrder: "asc" },
  });

  const snapshot = await prisma.pageVersion.create({
    data: {
      pageId,
      sections: JSON.stringify(sections),
      versionTag: versionTag ?? null,
    },
  });

  return snapshot;
}

export async function getVersionSnapshots(pageId: string): Promise<VersionSnapshot[]> {
  const snapshots = await prisma.pageVersion.findMany({
    where: { pageId },
    orderBy: { createdAt: "desc" },
  });

  return snapshots;
}

export async function restoreSnapshot(snapshotId: string): Promise<{ pageId: string; sections: unknown[] }> {
  const snapshot = await prisma.pageVersion.findUnique({
    where: { id: snapshotId },
  });

  if (!snapshot) {
    throw new Error("Snapshot not found");
  }

  const sections = JSON.parse(snapshot.sections) as Array<{
    id: string;
    blockType: string;
    sortOrder: number;
    content: string;
    settings: string;
  }>;

  await prisma.$transaction(async (tx) => {
    await tx.pageSection.deleteMany({
      where: { pageId: snapshot.pageId },
    });

    for (const section of sections) {
      await tx.pageSection.create({
        data: {
          pageId: snapshot.pageId,
          blockType: section.blockType,
          sortOrder: section.sortOrder,
          content: section.content,
          settings: section.settings,
        },
      });
    }
  });

  return { pageId: snapshot.pageId, sections };
}
