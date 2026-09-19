"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AuthSettingsProps {
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
}

export function AuthSettings({ values, onChange }: AuthSettingsProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Allow Registration</Label>
        <Select
          value={values["allow_registration"] ?? "true"}
          onValueChange={(v) => onChange("allow_registration", v)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">Enabled</SelectItem>
            <SelectItem value="false">Disabled</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Default User Role</Label>
        <Select
          value={values["default_role"] ?? "student"}
          onValueChange={(v) => onChange("default_role", v)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="student">Student</SelectItem>
            <SelectItem value="teacher">Teacher</SelectItem>
            <SelectItem value="parent">Parent</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="session-duration">Session Duration (hours)</Label>
        <Input
          id="session-duration"
          type="number"
          min={1}
          max={720}
          value={values["session_duration_hours"] ?? "168"}
          onChange={(e) => onChange("session_duration_hours", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>Enable Google OAuth</Label>
        <Select
          value={values["google_oauth_enabled"] ?? "false"}
          onValueChange={(v) => onChange("google_oauth_enabled", v)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">Enabled</SelectItem>
            <SelectItem value="false">Disabled</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
