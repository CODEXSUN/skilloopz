import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { SettingsTabs } from "@/components/settings/settings-tabs";

interface Metadata {
  interests?: string[];
  subjects?: string[];
  grade_levels?: string[];
  bio?: string;
  child_name?: string;
  child_interests?: string[];
  grade?: string;
  age_group?: string;
  notifyXp?: boolean;
  notifyAchievements?: boolean;
  notifyStreaks?: boolean;
  notifyCourseUpdates?: boolean;
  notifyMessages?: boolean;
  notifyGrading?: boolean;
}

export default async function SettingsPage() {
  const user = await getUser();
  if (!user) redirect("/login");

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
    select: {
      fullName: true,
      email: true,
      avatarUrl: true,
      role: true,
      ageGroup: true,
      metadata: true,
    },
  });

  if (!profile) redirect("/login");

  const metadata: Metadata = (() => {
    try {
      return JSON.parse(profile.metadata ?? "{}");
    } catch {
      return {};
    }
  })();

  const initialData = {
    fullName: profile.fullName ?? "",
    email: profile.email ?? "",
    avatarUrl: profile.avatarUrl ?? "",
    role: profile.role as "student" | "teacher" | "parent",
    ageGroup: (profile.ageGroup as "child" | "teen" | "adult") ?? "teen",
    grade: metadata.grade ?? "",
    interests: metadata.interests ?? [],
    subjects: metadata.subjects ?? [],
    gradeLevels: metadata.grade_levels ?? [],
    bio: metadata.bio ?? "",
    childName: metadata.child_name ?? "",
    childInterests: metadata.child_interests ?? [],
  };

  const defaults = {
    notifyXp: true,
    notifyAchievements: true,
    notifyStreaks: true,
    notifyCourseUpdates: true,
    notifyMessages: true,
    notifyGrading: true,
  };

  const notificationPreferences = {
    notifyXp: metadata.notifyXp ?? defaults.notifyXp,
    notifyAchievements: metadata.notifyAchievements ?? defaults.notifyAchievements,
    notifyStreaks: metadata.notifyStreaks ?? defaults.notifyStreaks,
    notifyCourseUpdates: metadata.notifyCourseUpdates ?? defaults.notifyCourseUpdates,
    notifyMessages: metadata.notifyMessages ?? defaults.notifyMessages,
    notifyGrading: metadata.notifyGrading ?? defaults.notifyGrading,
  };

  return (
    <SettingsTabs
      initialData={initialData}
      notificationPreferences={notificationPreferences}
    />
  );
}
