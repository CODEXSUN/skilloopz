"use client";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { FEATURE_FLAGS } from "@/lib/feature-flags-data";

interface FeatureTogglesSectionProps {
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
}

export function FeatureTogglesSection({ values, onChange }: FeatureTogglesSectionProps) {
  const groups = [...new Set(FEATURE_FLAGS.map((f) => f.group))];

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <div key={group}>
          <h3 className="mb-3 text-sm font-medium capitalize text-muted-foreground">{group}</h3>
          <div className="space-y-3">
            {FEATURE_FLAGS.filter((f) => f.group === group).map((flag) => {
              const currentValue = values[flag.key] ?? String(flag.defaultValue);
              return (
                <div
                  key={flag.key}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="space-y-0.5">
                    <Label
                      htmlFor={flag.key}
                      className="text-sm font-medium cursor-pointer"
                    >
                      {flag.label}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {flag.description}
                    </p>
                  </div>
                  <Switch
                    id={flag.key}
                    checked={currentValue === "true"}
                    onCheckedChange={(checked) =>
                      onChange(flag.key, checked ? "true" : "false")
                    }
                  />
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
