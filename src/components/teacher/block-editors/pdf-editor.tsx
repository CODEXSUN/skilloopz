"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PdfEditorProps {
  content: Record<string, unknown>;
  onChange: (content: Record<string, unknown>) => void;
}

export function PdfEditor({ content, onChange }: PdfEditorProps) {
  const { url, title } = content as {
    url?: string;
    title?: string;
  };

  function updateField(key: string, value: unknown) {
    onChange({ ...content, [key]: value });
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label className="text-xs">PDF URL</Label>
        <Input
          value={url ?? ""}
          onChange={(e) => updateField("url", e.target.value)}
          placeholder="https://..."
          className="h-8 text-xs"
        />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Title</Label>
        <Input
          value={title ?? ""}
          onChange={(e) => updateField("title", e.target.value)}
          placeholder="Optional title shown above the PDF"
          className="h-8 text-xs"
        />
      </div>
    </div>
  );
}
