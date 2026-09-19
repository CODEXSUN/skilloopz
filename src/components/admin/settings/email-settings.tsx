"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EmailSettingsProps {
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
}

export function EmailSettings({ values, onChange }: EmailSettingsProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="smtp-host">SMTP Host</Label>
        <Input
          id="smtp-host"
          value={values["smtp_host"] ?? ""}
          onChange={(e) => onChange("smtp_host", e.target.value)}
          placeholder="smtp.example.com"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="smtp-port">SMTP Port</Label>
        <Input
          id="smtp-port"
          type="number"
          value={values["smtp_port"] ?? "587"}
          onChange={(e) => onChange("smtp_port", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="smtp-user">SMTP Username</Label>
        <Input
          id="smtp-user"
          value={values["smtp_user"] ?? ""}
          onChange={(e) => onChange("smtp_user", e.target.value)}
          placeholder="user@example.com"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="smtp-pass">SMTP Password</Label>
        <Input
          id="smtp-pass"
          type="password"
          value={values["smtp_pass"] ?? ""}
          onChange={(e) => onChange("smtp_pass", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="from-email">From Email</Label>
        <Input
          id="from-email"
          type="email"
          value={values["from_email"] ?? ""}
          onChange={(e) => onChange("from_email", e.target.value)}
          placeholder="noreply@neot.com"
        />
      </div>
    </div>
  );
}
