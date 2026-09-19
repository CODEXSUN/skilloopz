"use client";

import { useState } from "react";
import { Save, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

interface SeoPageProps {
  initialValues: Record<string, string>;
}

export function SeoPage({ initialValues }: SeoPageProps) {
  const [values, setValues] = useState(initialValues);
  const [isSaving, setIsSaving] = useState(false);

  function handleChange(key: string, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setIsSaving(true);
    try {
      const settings = Object.entries(values).map(([key, value]) => ({
        key,
        value,
        group: "seo",
      }));
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error("Failed to save");
    } catch {
      alert("Failed to save SEO settings");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">SEO</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Global SEO settings for the platform.
          </p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save
        </Button>
      </div>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-2">
            <Label htmlFor="site_title">Site Title</Label>
            <Input
              id="site_title"
              value={values["site_title"] ?? ""}
              onChange={(e) => handleChange("site_title", e.target.value)}
              placeholder="NEOT"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="meta_description">Meta Description</Label>
            <Textarea
              id="meta_description"
              value={values["meta_description"] ?? ""}
              onChange={(e) => handleChange("meta_description", e.target.value)}
              placeholder="Describe your platform..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="og_image">OG Image URL</Label>
            <Input
              id="og_image"
              value={values["og_image"] ?? ""}
              onChange={(e) => handleChange("og_image", e.target.value)}
              placeholder="/og-image.png"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
