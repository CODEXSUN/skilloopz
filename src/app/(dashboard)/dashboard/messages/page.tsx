import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { StudentInboxContent } from "@/components/dashboard/student-inbox-content";

export default async function StudentInboxPage() {
  const user = await getUser();
  if (!user) redirect("/login");

  let messages: {
    id: string;
    subject: string;
    content: string;
    readAt: string | null;
    createdAt: string;
    sender: { fullName: string | null; role: string };
  }[] = [];

  try {
    const msgs = await prisma.message.findMany({
      where: { recipientId: user.id },
      include: {
        sender: { select: { fullName: true, role: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    messages = msgs.map((m) => ({
      id: m.id,
      subject: m.subject,
      content: m.content,
      readAt: m.readAt?.toISOString() ?? null,
      createdAt: m.createdAt.toISOString(),
      sender: { fullName: m.sender.fullName, role: m.sender.role },
    }));
  } catch {
    // Messages not available
  }

  return <StudentInboxContent messages={messages} />;
}
