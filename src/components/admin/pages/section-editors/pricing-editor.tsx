"use client";

import { Plus, Trash2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface PricingPlan {
  name?: string;
  price?: string;
  description?: string;
  features?: string[];
  ctaText?: string;
  ctaLink?: string;
  highlighted?: boolean;
}

interface PricingEditorProps {
  content: Record<string, unknown>;
  onChange: (content: Record<string, unknown>) => void;
}

export function PricingEditor({ content, onChange }: PricingEditorProps) {
  const plans = (content.plans as PricingPlan[]) ?? [];

  function updatePlan(index: number, data: Partial<PricingPlan>) {
    const next = [...plans];
    next[index] = { ...next[index], ...data };
    onChange({ ...content, plans: next });
  }

  function addPlan() {
    onChange({
      ...content,
      plans: [
        ...plans,
        { name: "", price: "", features: [""], ctaText: "Get Started", ctaLink: "/signup" },
      ],
    });
  }

  function removePlan(index: number) {
    onChange({
      ...content,
      plans: plans.filter((_, i) => i !== index),
    });
  }

  function addFeature(planIdx: number) {
    const next = [...plans];
    next[planIdx] = {
      ...next[planIdx],
      features: [...(next[planIdx].features ?? []), ""],
    };
    onChange({ ...content, plans: next });
  }

  function updateFeature(planIdx: number, featIdx: number, value: string) {
    const next = [...plans];
    const features = [...(next[planIdx].features ?? [])];
    features[featIdx] = value;
    next[planIdx] = { ...next[planIdx], features };
    onChange({ ...content, plans: next });
  }

  function removeFeature(planIdx: number, featIdx: number) {
    const next = [...plans];
    next[planIdx] = {
      ...next[planIdx],
      features: (next[planIdx].features ?? []).filter((_, i) => i !== featIdx),
    };
    onChange({ ...content, plans: next });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Pricing Plans</Label>
        <Button variant="outline" size="sm" onClick={addPlan}>
          <Plus className="h-3 w-3" />
          Add Plan
        </Button>
      </div>
      {plans.map((plan, i) => (
        <div
          key={i}
          className="space-y-3 rounded-lg border border-border p-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Plan {i + 1}
            </span>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  className="h-3.5 w-3.5 rounded border-border"
                  checked={plan.highlighted ?? false}
                  onChange={(e) =>
                    updatePlan(i, { highlighted: e.target.checked })
                  }
                />
                Highlight
              </label>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-red-500"
                onClick={() => removePlan(i)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              placeholder="Plan name"
              value={plan.name ?? ""}
              onChange={(e) => updatePlan(i, { name: e.target.value })}
            />
            <Input
              placeholder="Price"
              value={plan.price ?? ""}
              onChange={(e) => updatePlan(i, { price: e.target.value })}
            />
          </div>
          <Input
            placeholder="Description"
            value={plan.description ?? ""}
            onChange={(e) => updatePlan(i, { description: e.target.value })}
          />
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Features</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-5 text-xs"
                onClick={() => addFeature(i)}
              >
                <Plus className="h-3 w-3" />
                Add
              </Button>
            </div>
            {(plan.features ?? []).map((feat, fi) => (
              <div key={fi} className="flex items-center gap-1">
                <Input
                  value={feat}
                  onChange={(e) => updateFeature(i, fi, e.target.value)}
                  placeholder="Feature description"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 shrink-0 p-0 text-red-500"
                  onClick={() => removeFeature(i, fi)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              placeholder="CTA text"
              value={plan.ctaText ?? ""}
              onChange={(e) => updatePlan(i, { ctaText: e.target.value })}
            />
            <Input
              placeholder="CTA link"
              value={plan.ctaLink ?? ""}
              onChange={(e) => updatePlan(i, { ctaLink: e.target.value })}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
