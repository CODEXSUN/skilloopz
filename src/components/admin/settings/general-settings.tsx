"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface GeneralSettingsProps {
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
}

export function GeneralSettings({ values, onChange }: GeneralSettingsProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="site-name">Platform Name</Label>
        <Input
          id="site-name"
          value={values["site_name"] ?? ""}
          onChange={(e) => onChange("site_name", e.target.value)}
          placeholder="NEOT"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="site-description">Site Description</Label>
        <Textarea
          id="site-description"
          value={values["site_description"] ?? ""}
          onChange={(e) => onChange("site_description", e.target.value)}
          placeholder="Adaptive learning platform"
          rows={2}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="support-email">Support Email</Label>
        <Input
          id="support-email"
          type="email"
          value={values["support_email"] ?? ""}
          onChange={(e) => onChange("support_email", e.target.value)}
          placeholder="support@neot.com"
        />
      </div>
    </div>
  );
}
