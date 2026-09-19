import { getUser } from "@/lib/auth";
import { DashboardNotesContent } from "@/components/dashboard/notes-content";

export default async function DashboardNotesPage() {
  const user = await getUser();
  if (!user) return null;

  return <DashboardNotesContent />;
}
