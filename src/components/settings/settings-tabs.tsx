"use client";

import { useState } from "react";
import { User, Shield, Bell, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { SettingsForm } from "@/components/settings/settings-form";
import { SecuritySettings } from "@/components/settings/security-settings";
import { NotificationSettings } from "@/components/settings/notification-settings";
import { AccountSettings } from "@/components/settings/account-settings";

interface InitialData {
  fullName: string;
  email: string;
  avatarUrl: string;
  role: "student" | "teacher" | "parent";
  ageGroup: "child" | "teen" | "adult";
  grade: string;
  interests: string[];
  subjects: string[];
  gradeLevels: string[];
  bio: string;
  childName: string;
  childInterests: string[];
}

interface NotificationPreferences {
  notifyXp: boolean;
  notifyAchievements: boolean;
  notifyStreaks: boolean;
  notifyCourseUpdates: boolean;
  notifyMessages: boolean;
  notifyGrading: boolean;
}

interface Props {
  initialData: InitialData;
  notificationPreferences: NotificationPreferences;
}

const TABS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "security", label: "Security", icon: Shield },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "account", label: "Account", icon: AlertTriangle },
] as const;

export function SettingsTabs({ initialData, notificationPreferences }: Props) {
  const [activeTab, setActiveTab] = useState<string>("profile");

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your profile, security, and preferences
        </p>
      </div>

      <div className="flex gap-1 rounded-xl border bg-muted/30 p-1">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                activeTab === tab.id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {activeTab === "profile" && <SettingsForm initialData={initialData} />}
      {activeTab === "security" && <SecuritySettings />}
      {activeTab === "notifications" && (
        <NotificationSettings initial={notificationPreferences} />
      )}
      {activeTab === "account" && <AccountSettings />}
    </div>
  );
}
