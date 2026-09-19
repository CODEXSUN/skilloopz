"use client";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface VideoEditorProps {
  content: Record<string, unknown>;
  onChange: (content: Record<string, unknown>) => void;
}

type VideoProvider = "youtube" | "vimeo" | "direct";

export function VideoEditor({ content, onChange }: VideoEditorProps) {
  const { url, provider, caption, transcript } = content as {
    url?: string;
    provider?: VideoProvider;
    caption?: string;
    transcript?: string;
  };

  function updateField(key: string, value: unknown) {
    onChange({ ...content, [key]: value });
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <Label className="text-xs">Provider</Label>
          <Select
            value={provider ?? "youtube"}
            onValueChange={(v) => updateField("provider", v)}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="youtube">YouTube</SelectItem>
              <SelectItem value="vimeo">Vimeo</SelectItem>
              <SelectItem value="direct">Direct</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Video URL</Label>
          <Input
            value={url ?? ""}
            onChange={(e) => updateField("url", e.target.value)}
            placeholder="https://..."
            className="h-8 text-xs"
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Caption</Label>
        <Input
          value={caption ?? ""}
          onChange={(e) => updateField("caption", e.target.value)}
          placeholder="Optional caption shown below the video"
          className="h-8 text-xs"
        />
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Transcript</Label>
        <textarea
          value={transcript ?? ""}
          onChange={(e) => updateField("transcript", e.target.value)}
          placeholder="Paste video transcript here..."
          rows={4}
          className={cn(
            "w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground placeholder:text-tertiary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1",
          )}
        />
      </div>
    </div>
  );
}
