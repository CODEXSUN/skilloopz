"use client";

import { Plus, Trash2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface TestimonialItem {
  name?: string;
  role?: string;
  text?: string;
  avatar?: string;
}

interface TestimonialsEditorProps {
  content: Record<string, unknown>;
  onChange: (content: Record<string, unknown>) => void;
}

export function TestimonialsEditor({ content, onChange }: TestimonialsEditorProps) {
  const items = (content.items as TestimonialItem[]) ?? [];

  function updateItem(index: number, data: Partial<TestimonialItem>) {
    const next = [...items];
    next[index] = { ...next[index], ...data };
    onChange({ ...content, items: next });
  }

  function addItem() {
    onChange({
      ...content,
      items: [...items, { name: "", role: "", text: "" }],
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
        <Label>Testimonials</Label>
        <Button variant="outline" size="sm" onClick={addItem}>
          <Plus className="h-3 w-3" />
          Add Testimonial
        </Button>
      </div>
      {items.map((item, i) => (
        <div
          key={i}
          className="space-y-2 rounded-lg border border-border p-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Testimonial {i + 1}
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
            placeholder="Name"
            value={item.name ?? ""}
            onChange={(e) => updateItem(i, { name: e.target.value })}
          />
          <Input
            placeholder="Role"
            value={item.role ?? ""}
            onChange={(e) => updateItem(i, { role: e.target.value })}
          />
          <Textarea
            placeholder="Testimonial text"
            value={item.text ?? ""}
            onChange={(e) => updateItem(i, { text: e.target.value })}
            rows={3}
          />
        </div>
      ))}
    </div>
  );
}
