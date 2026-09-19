"use client";

import { useState } from "react";
import { useDevModeStore, type DeviceMode } from "@/stores/devModeStore";
import { usePageBuilderStore } from "@/stores/pageBuilderStore";

interface EffectsTabProps {
  sectionId: string;
}

export function EffectsTab({ sectionId }: EffectsTabProps) {
  const deviceMode = useDevModeStore((s) => s.deviceMode);
  const setDeviceMode = useDevModeStore((s) => s.setDeviceMode);
  const updateSection = usePageBuilderStore((s) => s.updateSection);
  const section = usePageBuilderStore((s) => s.sections.find((sec) => sec.id === sectionId));
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const styles = (section?.settings?.styles as Record<string, unknown>) ?? {};
  const responsiveStyles = (section?.settings?.responsiveStyles as Record<string, Record<string, unknown>>) ?? {};
  const effective = deviceMode !== "desktop" ? { ...styles, ...(responsiveStyles[deviceMode] ?? {}) } : styles;

  const toggle = (key: string) => setCollapsed((p) => ({ ...p, [key]: !p[key] }));

  const handleChange = (key: string, value: string | number | boolean) => {
    const sec = usePageBuilderStore.getState().sections.find((s) => s.id === sectionId);
    if (!sec) return;
    if (deviceMode !== "desktop") {
      const existing = (sec.settings.responsiveStyles as Record<string, Record<string, unknown>>) ?? {};
      updateSection(sectionId, {
        settings: {
          ...sec.settings,
          responsiveStyles: { ...existing, [deviceMode]: { ...(existing[deviceMode] ?? {}), [key]: value } },
        },
      });
    } else {
      updateSection(sectionId, {
        settings: { ...sec.settings, styles: { ...styles, [key]: value } },
      });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
      <Section title="Glassmorphism" collapsed={collapsed} onToggle={toggle}>
        <PropertyRow label="Blur">
          <SizeSlider
            value={String(effective.glassBlur ?? "0px")}
            onChange={(v) => handleChange("glassBlur", v)}
            max={64}
          />
        </PropertyRow>
        <PropertyRow label="Transparency">
          <SizeSlider
            value={String(effective.glassOpacity ?? "100%")}
            onChange={(v) => handleChange("glassOpacity", v)}
            max={100}
            unit="%"
          />
        </PropertyRow>
        <PropertyRow label="Backdrop Blur">
          <SizeSlider
            value={String(effective.backdropBlur ?? "0px")}
            onChange={(v) => handleChange("backdropBlur", v)}
            max={64}
          />
        </PropertyRow>
        <PropertyRow label="Saturate">
          <SizeSlider
            value={String(effective.glassSaturate ?? "100%")}
            onChange={(v) => handleChange("glassSaturate", v)}
            max={300}
            unit="%"
          />
        </PropertyRow>
      </Section>

      <Section title="Shadows" collapsed={collapsed} onToggle={toggle}>
        <PropertyRow label="Shadow">
          <select
            value={String(effective.boxShadow ?? "none")}
            onChange={(e) => handleChange("boxShadow", e.target.value)}
            className="w-full rounded-lg bg-muted/30 px-2 py-1.5 text-[11px] font-medium text-foreground outline-none ring-1 ring-border/50"
          >
            <option value="none">None</option>
            <option value="sm">Small</option>
            <option value="md">Medium</option>
            <option value="lg">Large</option>
            <option value="xl">Extra Large</option>
            <option value="glow-sm">Glow Small</option>
            <option value="glow-md">Glow Medium</option>
            <option value="glow-lg">Glow Large</option>
            <option value="inner">Inner</option>
          </select>
        </PropertyRow>
        <PropertyRow label="Shadow X">
          <SizeSlider
            value={String(effective.shadowOffsetX ?? "0px")}
            onChange={(v) => handleChange("shadowOffsetX", v)}
            max={40}
          />
        </PropertyRow>
        <PropertyRow label="Shadow Y">
          <SizeSlider
            value={String(effective.shadowOffsetY ?? "4px")}
            onChange={(v) => handleChange("shadowOffsetY", v)}
            max={40}
          />
        </PropertyRow>
        <PropertyRow label="Shadow Blur">
          <SizeSlider
            value={String(effective.shadowBlur ?? "12px")}
            onChange={(v) => handleChange("shadowBlur", v)}
            max={80}
          />
        </PropertyRow>
        <PropertyRow label="Shadow Spread">
          <SizeSlider
            value={String(effective.shadowSpread ?? "0px")}
            onChange={(v) => handleChange("shadowSpread", v)}
            max={40}
          />
        </PropertyRow>
        <PropertyRow label="Shadow Color">
          <ColorInput
            value={String(effective.shadowColor ?? "rgba(0,0,0,0.3)")}
            onChange={(v) => handleChange("shadowColor", v)}
          />
        </PropertyRow>
        <PropertyRow label="Inset">
          <input
            type="checkbox"
            checked={Boolean(effective.shadowInset)}
            onChange={(e) => handleChange("shadowInset", e.target.checked)}
            className="h-4 w-4 rounded border-border bg-muted/30 text-primary-500"
          />
        </PropertyRow>
        <PropertyRow label="Text Shadow">
          <SizeSlider
            value={String(effective.textShadowBlur ?? "0px")}
            onChange={(v) => handleChange("textShadowBlur", v)}
            max={40}
          />
        </PropertyRow>
      </Section>

      <Section title="Gradients" collapsed={collapsed} onToggle={toggle}>
        <PropertyRow label="Type">
          <select
            value={String(effective.gradientType ?? "none")}
            onChange={(e) => handleChange("gradientType", e.target.value)}
            className="w-full rounded-lg bg-muted/30 px-2 py-1.5 text-[11px] font-medium text-foreground outline-none ring-1 ring-border/50"
          >
            <option value="none">None</option>
            <option value="linear">Linear</option>
            <option value="radial">Radial</option>
            <option value="conic">Conic</option>
          </select>
        </PropertyRow>
        <PropertyRow label="Angle">
          <SizeSlider
            value={String(effective.gradientAngle ?? "180deg")}
            onChange={(v) => handleChange("gradientAngle", v)}
            max={360}
            unit="deg"
          />
        </PropertyRow>
        <PropertyRow label="Color 1">
          <ColorInput
            value={String(effective.gradientFrom ?? "#4F7CFF")}
            onChange={(v) => handleChange("gradientFrom", v)}
          />
        </PropertyRow>
        <PropertyRow label="Color 2">
          <ColorInput
            value={String(effective.gradientTo ?? "#0B0D10")}
            onChange={(v) => handleChange("gradientTo", v)}
          />
        </PropertyRow>
        <PropertyRow label="Color 3 (optional)">
          <ColorInput
            value={String(effective.gradientVia ?? "")}
            onChange={(v) => handleChange("gradientVia", v)}
          />
        </PropertyRow>
      </Section>

      <Section title="Transform" collapsed={collapsed} onToggle={toggle}>
        <PropertyRow label="Scale X">
          <SizeSlider
            value={String(effective.scaleX ?? "100%")}
            onChange={(v) => handleChange("scaleX", v)}
            max={200}
            unit="%"
          />
        </PropertyRow>
        <PropertyRow label="Scale Y">
          <SizeSlider
            value={String(effective.scaleY ?? "100%")}
            onChange={(v) => handleChange("scaleY", v)}
            max={200}
            unit="%"
          />
        </PropertyRow>
        <PropertyRow label="Rotate">
          <SizeSlider
            value={String(effective.rotate ?? "0deg")}
            onChange={(v) => handleChange("rotate", v)}
            max={360}
            unit="deg"
          />
        </PropertyRow>
        <PropertyRow label="Translate X">
          <SizeSlider
            value={String(effective.translateX ?? "0px")}
            onChange={(v) => handleChange("translateX", v)}
            max={200}
          />
        </PropertyRow>
        <PropertyRow label="Translate Y">
          <SizeSlider
            value={String(effective.translateY ?? "0px")}
            onChange={(v) => handleChange("translateY", v)}
            max={200}
          />
        </PropertyRow>
      </Section>

      <Section title="Filters" collapsed={collapsed} onToggle={toggle}>
        <PropertyRow label="Opacity">
          <SizeSlider
            value={String(effective.opacity ?? "100%")}
            onChange={(v) => handleChange("opacity", v)}
            max={100}
            unit="%"
          />
        </PropertyRow>
        <PropertyRow label="Brightness">
          <SizeSlider
            value={String(effective.brightness ?? "100%")}
            onChange={(v) => handleChange("brightness", v)}
            max={200}
            unit="%"
          />
        </PropertyRow>
        <PropertyRow label="Contrast">
          <SizeSlider
            value={String(effective.contrast ?? "100%")}
            onChange={(v) => handleChange("contrast", v)}
            max={200}
            unit="%"
          />
        </PropertyRow>
        <PropertyRow label="Saturate">
          <SizeSlider
            value={String(effective.filterSaturate ?? "100%")}
            onChange={(v) => handleChange("filterSaturate", v)}
            max={300}
            unit="%"
          />
        </PropertyRow>
        <PropertyRow label="Hue Rotate">
          <SizeSlider
            value={String(effective.hueRotate ?? "0deg")}
            onChange={(v) => handleChange("hueRotate", v)}
            max={360}
            unit="deg"
          />
        </PropertyRow>
        <PropertyRow label="Blur">
          <SizeSlider
            value={String(effective.filterBlur ?? "0px")}
            onChange={(v) => handleChange("filterBlur", v)}
            max={24}
          />
        </PropertyRow>
      </Section>

      <Section title="Responsive" collapsed={collapsed} onToggle={toggle}>
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
      </Section>
    </div>
  );
}

function Section({ title, collapsed, onToggle, children }: { title: string; collapsed: Record<string, boolean>; onToggle: (key: string) => void; children: React.ReactNode }) {
  const isCollapsed = collapsed[title] ?? false;
  return (
    <div>
      <button onClick={() => onToggle(title)} className="flex w-full items-center justify-between mb-2 group">
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

function SizeSlider({ value, onChange, max = 200, unit = "px" }: { value: string; onChange: (v: string) => void; max?: number; unit?: string }) {
  const numeric = parseFloat(value) || 0;
  return (
    <div className="flex items-center gap-2">
      <input
        type="range" min="0" max={max}
        value={numeric}
        onChange={(e) => onChange(`${parseFloat(e.target.value)}${unit}`)}
        className="h-1 w-full appearance-none rounded-full bg-muted accent-primary-500 cursor-pointer"
      />
      <input
        type="text" value={value}
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
        type="text" value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="#000000"
        className="flex-1 rounded-md bg-muted/30 px-1.5 py-1 text-[10px] font-mono text-foreground outline-none ring-1 ring-border/50"
      />
    </div>
  );
}
