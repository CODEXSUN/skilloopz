"use client";

import { useState } from "react";
import { useDevModeStore, type DeviceMode } from "@/stores/devModeStore";
import { usePageBuilderStore } from "@/stores/pageBuilderStore";

interface StyleTabProps {
  sectionId: string;
}

export function StyleTab({ sectionId }: StyleTabProps) {
  const deviceMode = useDevModeStore((s) => s.deviceMode);
  const setDeviceMode = useDevModeStore((s) => s.setDeviceMode);
  const updateSection = usePageBuilderStore((s) => s.updateSection);
  const section = usePageBuilderStore((s) => s.sections.find((sec) => sec.id === sectionId));
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const styles = (section?.settings?.styles as Record<string, unknown>) ?? {};
  const responsiveStyles = (section?.settings?.responsiveStyles as Record<string, Record<string, unknown>>) ?? {};

  const effectiveStyles = deviceMode !== "desktop"
    ? { ...styles, ...(responsiveStyles[deviceMode] ?? {}) }
    : styles;

  const toggle = (key: string) => setCollapsed((p) => ({ ...p, [key]: !p[key] }));

  const handleChange = (key: string, value: string | number | boolean) => {
    const sectionData = usePageBuilderStore.getState().sections.find((s) => s.id === sectionId);
    if (!sectionData) return;

    if (deviceMode !== "desktop") {
      const existing = (sectionData.settings.responsiveStyles as Record<string, Record<string, unknown>>) ?? {};
      updateSection(sectionId, {
        settings: {
          ...sectionData.settings,
          responsiveStyles: {
            ...existing,
            [deviceMode]: { ...(existing[deviceMode] ?? {}), [key]: value },
          },
        },
      });
    } else {
      updateSection(sectionId, {
        settings: {
          ...sectionData.settings,
          styles: { ...styles, [key]: value },
        },
      });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
      <Section title="Layout" collapsed={collapsed} onToggle={toggle}>
        <PropertyRow label="Display">
          <select
            value={String(effectiveStyles.display ?? "block")}
            onChange={(e) => handleChange("display", e.target.value)}
            className="w-full rounded-lg bg-muted/30 px-2 py-1.5 text-[11px] font-medium text-foreground outline-none ring-1 ring-border/50"
          >
            <option value="block">Block</option>
            <option value="flex">Flex</option>
            <option value="grid">Grid</option>
            <option value="inline">Inline</option>
            <option value="none">None</option>
          </select>
        </PropertyRow>
        <PropertyRow label="Direction">
          <select
            value={String(effectiveStyles.flexDirection ?? "column")}
            onChange={(e) => handleChange("flexDirection", e.target.value)}
            className="w-full rounded-lg bg-muted/30 px-2 py-1.5 text-[11px] font-medium text-foreground outline-none ring-1 ring-border/50"
          >
            <option value="column">Column</option>
            <option value="row">Row</option>
            <option value="column-reverse">Column Reverse</option>
            <option value="row-reverse">Row Reverse</option>
          </select>
        </PropertyRow>
        <PropertyRow label="Align Items">
          <select
            value={String(effectiveStyles.alignItems ?? "center")}
            onChange={(e) => handleChange("alignItems", e.target.value)}
            className="w-full rounded-lg bg-muted/30 px-2 py-1.5 text-[11px] font-medium text-foreground outline-none ring-1 ring-border/50"
          >
            <option value="start">Start</option>
            <option value="center">Center</option>
            <option value="end">End</option>
            <option value="stretch">Stretch</option>
          </select>
        </PropertyRow>
        <PropertyRow label="Justify">
          <select
            value={String(effectiveStyles.justifyContent ?? "center")}
            onChange={(e) => handleChange("justifyContent", e.target.value)}
            className="w-full rounded-lg bg-muted/30 px-2 py-1.5 text-[11px] font-medium text-foreground outline-none ring-1 ring-border/50"
          >
            <option value="start">Start</option>
            <option value="center">Center</option>
            <option value="end">End</option>
            <option value="between">Space Between</option>
            <option value="around">Space Around</option>
          </select>
        </PropertyRow>
        <PropertyRow label="Text Align">
          <select
            value={String(effectiveStyles.textAlign ?? "left")}
            onChange={(e) => handleChange("textAlign", e.target.value)}
            className="w-full rounded-lg bg-muted/30 px-2 py-1.5 text-[11px] font-medium text-foreground outline-none ring-1 ring-border/50"
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </PropertyRow>
        <PropertyRow label="Width">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={String(effectiveStyles.width ?? "")}
              onChange={(e) => handleChange("width", e.target.value)}
              placeholder="auto"
              className="flex-1 rounded-lg bg-muted/30 px-2 py-1.5 text-[11px] font-mono text-foreground outline-none ring-1 ring-border/50"
            />
          </div>
        </PropertyRow>
        <PropertyRow label="Max Width">
          <select
            value={String(effectiveStyles.maxWidth ?? "max-w-6xl")}
            onChange={(e) => handleChange("maxWidth", e.target.value)}
            className="w-full rounded-lg bg-muted/30 px-2 py-1.5 text-[11px] font-medium text-foreground outline-none ring-1 ring-border/50"
          >
            <option value="max-w-none">None</option>
            <option value="max-w-4xl">4xl (896px)</option>
            <option value="max-w-5xl">5xl (1024px)</option>
            <option value="max-w-6xl">6xl (1152px)</option>
            <option value="max-w-7xl">7xl (1280px)</option>
            <option value="max-w-full">Full</option>
          </select>
        </PropertyRow>
      </Section>

      <Section title="Spacing" collapsed={collapsed} onToggle={toggle}>
        <PropertyRow label="Padding Top">
          <SizeSlider value={String(effectiveStyles.paddingTop ?? "0px")} onChange={(v) => handleChange("paddingTop", v)} />
        </PropertyRow>
        <PropertyRow label="Padding Right">
          <SizeSlider value={String(effectiveStyles.paddingRight ?? "0px")} onChange={(v) => handleChange("paddingRight", v)} />
        </PropertyRow>
        <PropertyRow label="Padding Bottom">
          <SizeSlider value={String(effectiveStyles.paddingBottom ?? "0px")} onChange={(v) => handleChange("paddingBottom", v)} />
        </PropertyRow>
        <PropertyRow label="Padding Left">
          <SizeSlider value={String(effectiveStyles.paddingLeft ?? "0px")} onChange={(v) => handleChange("paddingLeft", v)} />
        </PropertyRow>
        <PropertyRow label="Margin Top">
          <SizeSlider value={String(effectiveStyles.marginTop ?? "0px")} onChange={(v) => handleChange("marginTop", v)} />
        </PropertyRow>
        <PropertyRow label="Margin Bottom">
          <SizeSlider value={String(effectiveStyles.marginBottom ?? "0px")} onChange={(v) => handleChange("marginBottom", v)} />
        </PropertyRow>
        <PropertyRow label="Gap">
          <SizeSlider value={String(effectiveStyles.gap ?? "0px")} onChange={(v) => handleChange("gap", v)} />
        </PropertyRow>
      </Section>

      <Section title="Typography" collapsed={collapsed} onToggle={toggle}>
        <PropertyRow label="Font">
          <select
            value={String(effectiveStyles.fontFamily ?? "sans")}
            onChange={(e) => handleChange("fontFamily", e.target.value)}
            className="w-full rounded-lg bg-muted/30 px-2 py-1.5 text-[11px] font-medium text-foreground outline-none ring-1 ring-border/50"
          >
            <option value="sans">Sans Serif</option>
            <option value="serif">Serif</option>
            <option value="mono">Monospace</option>
            <option value="display">Display</option>
          </select>
        </PropertyRow>
        <PropertyRow label="Size">
          <SizeSlider value={String(effectiveStyles.fontSize ?? "16px")} onChange={(v) => handleChange("fontSize", v)} max={128} />
        </PropertyRow>
        <PropertyRow label="Weight">
          <select
            value={String(effectiveStyles.fontWeight ?? "400")}
            onChange={(e) => handleChange("fontWeight", e.target.value)}
            className="w-full rounded-lg bg-muted/30 px-2 py-1.5 text-[11px] font-medium text-foreground outline-none ring-1 ring-border/50"
          >
            <option value="300">Light (300)</option>
            <option value="400">Regular (400)</option>
            <option value="500">Medium (500)</option>
            <option value="600">Semi Bold (600)</option>
            <option value="700">Bold (700)</option>
            <option value="800">Extra Bold (800)</option>
          </select>
        </PropertyRow>
        <PropertyRow label="Line Height">
          <SizeSlider value={String(effectiveStyles.lineHeight ?? "1.5")} onChange={(v) => handleChange("lineHeight", v)} max={4} unit="" step={0.1} />
        </PropertyRow>
        <PropertyRow label="Letter Spacing">
          <SizeSlider value={String(effectiveStyles.letterSpacing ?? "0px")} onChange={(v) => handleChange("letterSpacing", v)} max={20} />
        </PropertyRow>
        <PropertyRow label="Text Color">
          <ColorInput value={String(effectiveStyles.color ?? "#ffffff")} onChange={(v) => handleChange("color", v)} />
        </PropertyRow>
      </Section>

      <Section title="Colors" collapsed={collapsed} onToggle={toggle}>
        <PropertyRow label="Background">
          <ColorInput value={String(effectiveStyles.backgroundColor ?? "transparent")} onChange={(v) => handleChange("backgroundColor", v)} />
        </PropertyRow>
        <PropertyRow label="Text Color">
          <ColorInput value={String(effectiveStyles.color ?? "#ffffff")} onChange={(v) => handleChange("color", v)} />
        </PropertyRow>
        <PropertyRow label="Border Color">
          <ColorInput value={String(effectiveStyles.borderColor ?? "transparent")} onChange={(v) => handleChange("borderColor", v)} />
        </PropertyRow>
        <PropertyRow label="Accent">
          <ColorInput value={String(effectiveStyles.accentColor ?? "#4F7CFF")} onChange={(v) => handleChange("accentColor", v)} />
        </PropertyRow>
      </Section>

      <Section title="Borders" collapsed={collapsed} onToggle={toggle}>
        <PropertyRow label="Width">
          <SizeSlider value={String(effectiveStyles.borderWidth ?? "0px")} onChange={(v) => handleChange("borderWidth", v)} max={16} />
        </PropertyRow>
        <PropertyRow label="Style">
          <select
            value={String(effectiveStyles.borderStyle ?? "solid")}
            onChange={(e) => handleChange("borderStyle", e.target.value)}
            className="w-full rounded-lg bg-muted/30 px-2 py-1.5 text-[11px] font-medium text-foreground outline-none ring-1 ring-border/50"
          >
            <option value="solid">Solid</option>
            <option value="dashed">Dashed</option>
            <option value="dotted">Dotted</option>
            <option value="none">None</option>
          </select>
        </PropertyRow>
        <PropertyRow label="Radius">
          <SizeSlider value={String(effectiveStyles.borderRadius ?? "0px")} onChange={(v) => handleChange("borderRadius", v)} max={48} />
        </PropertyRow>
      </Section>

      <Section title="Responsive Overrides" collapsed={collapsed} onToggle={toggle}>
        <PropertyRow label="Breakpoint">
          <select
            value={deviceMode}
            onChange={(e) => setDeviceMode(e.target.value as DeviceMode)}
            className="w-full rounded-lg bg-muted/30 px-2 py-1.5 text-[11px] font-medium text-foreground outline-none ring-1 ring-border/50"
          >
            <option value="desktop">Desktop (1025px+)</option>
            <option value="tablet">Tablet (768–1024px)</option>
            <option value="mobile">Mobile (320–767px)</option>
          </select>
        </PropertyRow>
        {deviceMode !== "desktop" && (
          <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-2 text-[10px] text-amber-400">
            Editing {deviceMode} overrides — values set here apply only at this breakpoint.
          </div>
        )}
        {deviceMode !== "desktop" && (
          <button
            onClick={() => {
              const sectionData = usePageBuilderStore.getState().sections.find((s) => s.id === sectionId);
              if (!sectionData) return;
              updateSection(sectionId, {
                settings: {
                  ...sectionData.settings,
                  responsiveStyles: {
                    ...(sectionData.settings.responsiveStyles as Record<string, unknown>),
                    [deviceMode]: {},
                  },
                },
              });
            }}
            className="w-full rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-1.5 text-[10px] text-red-400 hover:bg-red-500/20 transition-colors"
          >
            Clear {deviceMode} overrides
          </button>
        )}
      </Section>
    </div>
  );
}

function Section({ title, collapsed, onToggle, children }: { title: string; collapsed: Record<string, boolean>; onToggle: (key: string) => void; children: React.ReactNode }) {
  const isCollapsed = collapsed[title] ?? false;
  return (
    <div>
      <button
        onClick={() => onToggle(title)}
        className="flex w-full items-center justify-between mb-2 group"
      >
        <h4 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">{title}</h4>
        <span className="text-[10px] text-muted-foreground/40 group-hover:text-muted-foreground transition-colors">
          {isCollapsed ? "▸" : "▾"}
        </span>
      </button>
      {!isCollapsed && <div className="space-y-2">{children}</div>}
    </div>
  );
}

function PropertyRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[10px] text-muted-foreground min-w-[72px]">{label}</span>
      <div className="flex-1">{children}</div>
    </div>
  );
}

function SizeSlider({ value, onChange, max = 200, unit = "px", step = 1 }: { value: string; onChange: (v: string) => void; max?: number; unit?: string; step?: number }) {
  const numeric = parseFloat(value) || 0;
  const detectedUnit = unit || value.replace(/[0-9.-]/g, "") || "px";

  return (
    <div className="flex items-center gap-2">
      <input
        type="range"
        min="0"
        max={max}
        step={step}
        value={numeric}
        onChange={(e) => onChange(`${parseFloat(e.target.value)}${detectedUnit}`)}
        className="h-1 w-full appearance-none rounded-full bg-muted accent-primary-500 cursor-pointer"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-12 rounded-md bg-muted/30 px-1.5 py-1 text-[10px] font-mono text-foreground text-right outline-none ring-1 ring-border/50"
      />
    </div>
  );
}

function ColorInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-1.5">
      <input
        type="color"
        value={value.startsWith("#") ? value : "#0B0D10"}
        onChange={(e) => onChange(e.target.value)}
        className="h-6 w-8 cursor-pointer rounded border-0 bg-muted/30 p-0.5"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="#000000"
        className="flex-1 rounded-md bg-muted/30 px-1.5 py-1 text-[10px] font-mono text-foreground outline-none ring-1 ring-border/50"
      />
    </div>
  );
}
