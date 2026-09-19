import { notFound, redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { CertificateDisplay } from "@/components/courses/certificate-display";

export default async function CertificatePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const user = await getUser();
  if (!user) redirect("/login");

  const certificate = await prisma.certificate.findFirst({
    where: { userId: user.id, courseId },
    include: {
      course: { select: { id: true, title: true, description: true } },
    },
  });

  if (!certificate) notFound();

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
    select: { fullName: true, email: true },
  });

  return (
    <CertificateDisplay
      serial={certificate.serial}
      issuedAt={certificate.issuedAt}
      courseTitle={certificate.course.title}
      userName={profile?.fullName ?? user.email ?? "Student"}
    />
  );
}
