"use client";

import { useState } from "react";
import { Save, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { BlockDefinition } from "@/components/admin/blocks/block-library";

interface BlockTypeEditorProps {
  block: BlockDefinition;
  onSave?: () => void;
}

export function BlockTypeEditor({ block, onSave }: BlockTypeEditorProps) {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave() {
    setIsSaving(true);
    try {
      await fetch(`/api/admin/blocks/${block.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });
      onSave?.();
    } catch {
      // ignore
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">{block.name}</h2>
          <p className="text-sm text-muted-foreground">{block.description}</p>
        </div>
        <Button size="sm" onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save
        </Button>
      </div>

      <div className="space-y-2">
        <Label>Block ID</Label>
        <Input value={block.id} disabled className="font-mono text-xs" />
      </div>

      <div className="space-y-4">
        <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Field Definitions ({block.fields.length})
        </h3>
        {block.fields.length === 0 ? (
          <p className="text-sm text-tertiary-foreground">No configurable fields.</p>
        ) : (
          <div className="space-y-3">
            {block.fields.map((field) => (
              <div
                key={field.key}
                className="rounded-lg border border-border p-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-foreground">
                      {field.label}
                    </span>
                    {field.required && (
                      <span className="ml-2 text-xs text-red-500">required</span>
                    )}
                  </div>
                  <Select value={field.type} disabled>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={field.type}>{field.type}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <p className="mt-1 font-mono text-xs text-tertiary-foreground">
                  {field.key}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
