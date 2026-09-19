"use client";

import { Plus, Trash2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface FaqItem {
  question?: string;
  answer?: string;
}

interface FaqEditorProps {
  content: Record<string, unknown>;
  onChange: (content: Record<string, unknown>) => void;
}

export function FaqEditor({ content, onChange }: FaqEditorProps) {
  const items = (content.items as FaqItem[]) ?? [];

  function updateItem(index: number, data: Partial<FaqItem>) {
    const next = [...items];
    next[index] = { ...next[index], ...data };
    onChange({ ...content, items: next });
  }

  function addItem() {
    onChange({
      ...content,
      items: [...items, { question: "", answer: "" }],
    });
  }

  function removeItem(index: number) {
    onChange({
      ...content,
      items: items.filter((_, i) => i !== index),
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>FAQ Items</Label>
        <Button variant="outline" size="sm" onClick={addItem}>
          <Plus className="h-3 w-3" />
          Add Question
        </Button>
      </div>
      {items.map((item, i) => (
        <div
          key={i}
          className="space-y-2 rounded-lg border border-border p-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Q{i + 1}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-red-500"
              onClick={() => removeItem(i)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
          <Input
            placeholder="Question"
            value={item.question ?? ""}
            onChange={(e) => updateItem(i, { question: e.target.value })}
          />
          <Textarea
            placeholder="Answer"
            value={item.answer ?? ""}
            onChange={(e) => updateItem(i, { answer: e.target.value })}
            rows={2}
          />
        </div>
      ))}
    </div>
  );
}
