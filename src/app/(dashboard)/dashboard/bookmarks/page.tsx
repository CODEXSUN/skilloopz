import { getUser } from "@/lib/auth";
import { DashboardBookmarksContent } from "@/components/dashboard/bookmarks-content";

export default async function DashboardBookmarksPage() {
  const user = await getUser();
  if (!user) return null;

  return <DashboardBookmarksContent />;
}
