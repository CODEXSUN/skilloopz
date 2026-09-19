"use client";

import { Plus, Trash2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FeatureCard {
  icon?: string;
  title?: string;
  description?: string;
}

interface FeatureGridEditorProps {
  content: Record<string, unknown>;
  onChange: (content: Record<string, unknown>) => void;
}

export function FeatureGridEditor({ content, onChange }: FeatureGridEditorProps) {
  const cards = (content.cards as FeatureCard[]) ?? [];
  const columns = (content.columns as number) ?? 3;

  function updateCard(index: number, data: Partial<FeatureCard>) {
    const next = [...cards];
    next[index] = { ...next[index], ...data };
    onChange({ ...content, cards: next });
  }

  function addCard() {
    onChange({
      ...content,
      cards: [...cards, { icon: "Box", title: "", description: "" }],
    });
  }

  function removeCard(index: number) {
    onChange({
      ...content,
      cards: cards.filter((_, i) => i !== index),
    });
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Columns</Label>
        <Select
          value={String(columns)}
          onValueChange={(v) => onChange({ ...content, columns: Number(v) })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2">2 Columns</SelectItem>
            <SelectItem value="3">3 Columns</SelectItem>
            <SelectItem value="4">4 Columns</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Feature Cards</Label>
          <Button variant="outline" size="sm" onClick={addCard}>
            <Plus className="h-3 w-3" />
            Add Card
          </Button>
        </div>
        {cards.map((card, i) => (
          <div
            key={i}
            className="space-y-2 rounded-lg border border-border p-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Card {i + 1}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-red-500"
                onClick={() => removeCard(i)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
            <Input
              placeholder="Icon name"
              value={card.icon ?? ""}
              onChange={(e) => updateCard(i, { icon: e.target.value })}
            />
            <Input
              placeholder="Title"
              value={card.title ?? ""}
              onChange={(e) => updateCard(i, { title: e.target.value })}
            />
            <Input
              placeholder="Description"
              value={card.description ?? ""}
              onChange={(e) => updateCard(i, { description: e.target.value })}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
