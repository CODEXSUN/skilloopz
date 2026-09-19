"use client";

import { useState, useEffect, useCallback } from "react";
import { Save, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GeneralSettings } from "@/components/admin/settings/general-settings";
import { AuthSettings } from "@/components/admin/settings/auth-settings";
import { EmailSettings } from "@/components/admin/settings/email-settings";
import { FeatureTogglesSection } from "@/components/admin/settings/feature-toggles-section";

interface SettingRecord {
  key: string;
  value: string;
  group: string;
}

export function SettingsPage() {
  const [settings, setSettings] = useState<SettingRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const values: Record<string, string> = {};
  for (const s of settings) {
    values[s.key] = s.value;
  }

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        setSettings(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  function handleChange(key: string, value: string) {
    setSettings((prev) => {
      const existing = prev.find((s) => s.key === key);
      if (existing) {
        return prev.map((s) => (s.key === key ? { ...s, value } : s));
      }
      return [...prev, { key, value, group: "general" }];
    });
  }

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error("Failed to save");
      setSettings(await res.json());
    } catch {
      alert("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  }, [settings]);

  if (isLoading) {
    return <div className="py-8 text-center text-sm text-tertiary-foreground">Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure platform-wide settings.
          </p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save
        </Button>
      </div>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="auth">Auth</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
        </TabsList>
        <TabsContent value="general" className="mt-4">
          <GeneralSettings values={values} onChange={handleChange} />
        </TabsContent>
        <TabsContent value="auth" className="mt-4">
          <AuthSettings values={values} onChange={handleChange} />
        </TabsContent>
        <TabsContent value="email" className="mt-4">
          <EmailSettings values={values} onChange={handleChange} />
        </TabsContent>
        <TabsContent value="features" className="mt-4">
          <FeatureTogglesSection values={values} onChange={handleChange} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
