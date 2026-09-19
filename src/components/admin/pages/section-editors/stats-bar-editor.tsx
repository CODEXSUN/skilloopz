"use client";

import { Plus, Trash2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface StatItem {
  number?: string;
  label?: string;
  icon?: string;
  prefix?: string;
  suffix?: string;
}

interface StatsBarEditorProps {
  content: Record<string, unknown>;
  onChange: (content: Record<string, unknown>) => void;
}

export function StatsBarEditor({ content, onChange }: StatsBarEditorProps) {
  const items = (content.items as StatItem[]) ?? [];

  function updateItem(index: number, data: Partial<StatItem>) {
    const next = [...items];
    next[index] = { ...next[index], ...data };
    onChange({ ...content, items: next });
  }

  function addItem() {
    onChange({
      ...content,
      items: [...items, { number: "", label: "", icon: "BarChart3" }],
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
        <Label>Stat Items</Label>
        <Button variant="outline" size="sm" onClick={addItem}>
          <Plus className="h-3 w-3" />
          Add Stat
        </Button>
      </div>
      {items.map((item, i) => (
        <div
          key={i}
          className="space-y-2 rounded-lg border border-border p-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Stat {i + 1}
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
            placeholder="Number (e.g. 10,000+)"
            value={item.number ?? ""}
            onChange={(e) => updateItem(i, { number: e.target.value })}
          />
          <Input
            placeholder="Label (e.g. Active Students)"
            value={item.label ?? ""}
            onChange={(e) => updateItem(i, { label: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="Prefix (e.g. $)"
              value={item.prefix ?? ""}
              onChange={(e) => updateItem(i, { prefix: e.target.value })}
            />
            <Input
              placeholder="Suffix (e.g. +)"
              value={item.suffix ?? ""}
              onChange={(e) => updateItem(i, { suffix: e.target.value })}
            />
          </div>
          <Input
            placeholder="Icon name"
            value={item.icon ?? ""}
            onChange={(e) => updateItem(i, { icon: e.target.value })}
          />
        </div>
      ))}
    </div>
  );
}
