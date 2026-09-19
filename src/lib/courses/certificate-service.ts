import { prisma } from "@/lib/db";

function generateSerial(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `NEOT-${ts}-${rand}`;
}

export async function issueCertificate(userId: string, courseId: string) {
  return await prisma.$transaction(async (tx: any) => {
    const existing = await tx.certificate.findFirst({
      where: { userId, courseId },
    });
    if (existing) return { id: existing.id, serial: existing.serial, alreadyIssued: true };

    const serial = generateSerial();
    const certificate = await tx.certificate.create({
      data: { userId, courseId, serial },
    });

    return { id: certificate.id, serial, alreadyIssued: false };
  });
}

export async function getUserCertificates(userId: string) {
  return prisma.certificate.findMany({
    where: { userId },
    include: {
      course: { select: { id: true, title: true, description: true } },
    },
    orderBy: { issuedAt: "desc" },
  });
}

export async function getCertificate(id: string) {
  return prisma.certificate.findUnique({
    where: { id },
    include: {
      user: { select: { fullName: true, email: true } },
      course: { select: { title: true, description: true } },
    },
  });
}
