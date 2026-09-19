"use client";

import { useState, useCallback } from "react";
import { Save, Loader2, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ColorPicker } from "@/components/admin/themes/color-picker";
import { FontSelector } from "@/components/admin/themes/font-selector";
import { AnimationConfig } from "@/components/admin/themes/animation-config";
import { LivePreviewPanel } from "@/components/admin/themes/live-preview-panel";
import {
  type ThemeTokens,
  parseTokens,
} from "@/lib/theme/theme-converter";

interface ThemeEditorProps {
  initialName: string;
  initialTokens: string;
  onSave: (name: string, tokens: string) => Promise<void>;
}

export function ThemeEditor({ initialName, initialTokens, onSave }: ThemeEditorProps) {
  const [name, setName] = useState(initialName);
  const [tokens, setTokens] = useState<ThemeTokens>(parseTokens(initialTokens));
  const [isSaving, setIsSaving] = useState(false);

  const hasChanges =
    name !== initialName || JSON.stringify(tokens) !== JSON.stringify(parseTokens(initialTokens));

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      await onSave(name, JSON.stringify(tokens));
    } finally {
      setIsSaving(false);
    }
  }, [name, tokens, onSave]);

  function updateColors(partial: Partial<ThemeTokens["colors"]>) {
    setTokens((prev) => ({ ...prev, colors: { ...prev.colors, ...partial } }));
  }

  function updateTypography(partial: Partial<ThemeTokens["typography"]>) {
    setTokens((prev) => ({ ...prev, typography: { ...prev.typography, ...partial } }));
  }

  function updateRadii(partial: Partial<ThemeTokens["radii"]>) {
    setTokens((prev) => ({ ...prev, radii: { ...prev.radii, ...partial } }));
  }

  const colorGroups: { label: string; keys: (keyof ThemeTokens["colors"])[] }[] = [
    {
      label: "Brand",
      keys: ["primary", "primaryLight", "primaryDark", "secondary", "accent"],
    },
    {
      label: "Backgrounds",
      keys: ["background", "backgroundAlt", "surface"],
    },
    {
      label: "Text",
      keys: ["text", "textSecondary", "textOnPrimary"],
    },
    {
      label: "States",
      keys: ["success", "warning", "error"],
    },
    {
      label: "Borders & Shadows",
      keys: ["border", "divider", "shadow"],
    },
  ];

  return (
    <div className="flex h-full">
      <div className="flex w-[440px] shrink-0 flex-col border-r border-border">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="max-w-[240px] font-semibold"
            placeholder="Theme name"
          />
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!hasChanges}
              onClick={() => setTokens(parseTokens(initialTokens))}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </Button>
            <Button size="sm" onClick={handleSave} disabled={!hasChanges || isSaving}>
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <Tabs defaultValue="colors">
            <TabsList className="w-full">
              <TabsTrigger value="colors" className="flex-1">Colors</TabsTrigger>
              <TabsTrigger value="typography" className="flex-1">Typography</TabsTrigger>
              <TabsTrigger value="radii" className="flex-1">Radii</TabsTrigger>
              <TabsTrigger value="animations" className="flex-1">Animations</TabsTrigger>
            </TabsList>

            <TabsContent value="colors" className="mt-4 space-y-6">
              {colorGroups.map((group) => (
                <div key={group.label} className="space-y-2">
                  <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {group.label}
                  </h4>
                  <div className="space-y-2">
                    {group.keys.map((key) => (
                      <ColorPicker
                        key={key}
                        label={key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())}
                        value={tokens.colors[key]}
                        onChange={(v) => updateColors({ [key]: v })}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="typography" className="mt-4 space-y-4">
              <FontSelector
                label="Heading Font"
                value={tokens.typography.headingFont}
                onChange={(v) => updateTypography({ headingFont: v })}
              />
              <FontSelector
                label="Body Font"
                value={tokens.typography.bodyFont}
                onChange={(v) => updateTypography({ bodyFont: v })}
              />
              <div className="space-y-1.5">
                <Label className="text-xs">Base Font Size (px)</Label>
                <Input
                  type="number"
                  min={10}
                  max={24}
                  value={tokens.typography.baseSize}
                  onChange={(e) => updateTypography({ baseSize: Number(e.target.value) })}
                />
              </div>
            </TabsContent>

            <TabsContent value="radii" className="mt-4 space-y-4">
              {(["sm", "md", "lg", "xl", "full"] as const).map((key) => (
                <div key={key} className="space-y-1.5">
                  <Label className="text-xs capitalize">{key}</Label>
                  <Input
                    value={tokens.radii[key]}
                    onChange={(e) => updateRadii({ [key]: e.target.value })}
                    placeholder={key === "full" ? "9999px" : "8px"}
                    className="font-mono text-xs"
                  />
                </div>
              ))}
            </TabsContent>

            <TabsContent value="animations" className="mt-4">
              <AnimationConfig
                easing={tokens.animations.default}
                duration={tokens.animations.duration}
                pageTransition={tokens.animations.pageTransition}
                onEasingChange={(v) =>
                  setTokens((prev) => ({
                    ...prev,
                    animations: { ...prev.animations, default: v },
                  }))
                }
                onDurationChange={(v) =>
                  setTokens((prev) => ({
                    ...prev,
                    animations: { ...prev.animations, duration: v },
                  }))
                }
                onPageTransitionChange={(v) =>
                  setTokens((prev) => ({
                    ...prev,
                    animations: { ...prev.animations, pageTransition: v },
                  }))
                }
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-muted p-8">
        <div className="mx-auto max-w-lg">
          <LivePreviewPanel tokens={tokens} />
        </div>
      </div>
    </div>
  );
}
