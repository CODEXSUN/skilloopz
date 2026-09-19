"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CtaEditorProps {
  content: Record<string, unknown>;
  onChange: (content: Record<string, unknown>) => void;
}

export function CtaEditor({ content, onChange }: CtaEditorProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="cta-text">Text</Label>
        <Textarea
          id="cta-text"
          value={(content.text as string) ?? ""}
          onChange={(e) => onChange({ ...content, text: e.target.value })}
          placeholder="Ready to start learning?"
          rows={2}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="cta-button-text">Button Text</Label>
          <Input
            id="cta-button-text"
            value={(content.buttonText as string) ?? ""}
            onChange={(e) => onChange({ ...content, buttonText: e.target.value })}
            placeholder="Get Started"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cta-button-link">Button Link</Label>
          <Input
            id="cta-button-link"
            value={(content.buttonLink as string) ?? ""}
            onChange={(e) => onChange({ ...content, buttonLink: e.target.value })}
            placeholder="/signup"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Background</Label>
        <Select
          value={(content.background as string) ?? "primary"}
          onValueChange={(v) => onChange({ ...content, background: v })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="primary">Primary</SelectItem>
            <SelectItem value="secondary">Secondary</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
            <SelectItem value="image">Image</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
