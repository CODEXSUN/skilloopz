"use client";

import { usePageBuilderStore } from "@/stores/pageBuilderStore";

interface GlobalStylesTabProps {
  sectionId: string;
}

interface ThemeOverride {
  colors?: Record<string, string>;
  typography?: Record<string, string>;
  radii?: Record<string, string>;
}

const COLOR_KEYS = [
  { key: "primary", label: "Primary" },
  { key: "primaryLight", label: "Primary Light" },
  { key: "primaryDark", label: "Primary Dark" },
  { key: "secondary", label: "Secondary" },
  { key: "accent", label: "Accent" },
  { key: "background", label: "Background" },
  { key: "text", label: "Text" },
  { key: "textSecondary", label: "Text Secondary" },
  { key: "success", label: "Success" },
  { key: "warning", label: "Warning" },
  { key: "error", label: "Error" },
  { key: "border", label: "Border" },
];

const TYPOGRAPHY_KEYS = [
  { key: "headingFont", label: "Heading Font" },
  { key: "bodyFont", label: "Body Font" },
  { key: "baseSize", label: "Base Size (px)" },
];

const RADII_KEYS = [
  { key: "sm", label: "Small" },
  { key: "md", label: "Medium" },
  { key: "lg", label: "Large" },
  { key: "xl", label: "XLarge" },
];

export function GlobalStylesTab({ sectionId }: GlobalStylesTabProps) {
  const updateSection = usePageBuilderStore((s) => s.updateSection);
  const section = usePageBuilderStore((s) => s.sections.find((sec) => sec.id === sectionId));

  const overrides: ThemeOverride = (section?.settings?.themeOverrides as ThemeOverride) ?? {};

  const update = (partial: ThemeOverride) => {
    const sec = usePageBuilderStore.getState().sections.find((s) => s.id === sectionId);
    if (!sec) return;
    updateSection(sectionId, {
      settings: {
        ...sec.settings,
        themeOverrides: { ...overrides, ...partial },
      },
    });
  };

  const clean = (obj: Record<string, string | undefined>): Record<string, string> => {
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(obj)) {
      if (v) out[k] = v;
    }
    return out;
  };

  const updateColor = (key: string, value: string) => {
    const next = { ...(overrides.colors ?? {}), [key]: value };
    update({ colors: Object.keys(clean(next)).length > 0 ? clean(next) : undefined });
  };

  const updateTypography = (key: string, value: string) => {
    const next = { ...(overrides.typography ?? {}), [key]: value };
    update({ typography: Object.keys(clean(next)).length > 0 ? clean(next) : undefined });
  };

  const updateRadius = (key: string, value: string) => {
    const next = { ...(overrides.radii ?? {}), [key]: value };
    update({ radii: Object.keys(clean(next)).length > 0 ? clean(next) : undefined });
  };

  const clearOverrides = () => {
    const sec = usePageBuilderStore.getState().sections.find((s) => s.id === sectionId);
    if (!sec) return;
    const { themeOverrides: _, ...rest } = sec.settings as Record<string, unknown> & { themeOverrides?: ThemeOverride };
    updateSection(sectionId, { settings: rest });
  };

  const hasOverrides = Object.keys(overrides.colors ?? {}).length > 0 ||
    Object.keys(overrides.typography ?? {}).length > 0 ||
    Object.keys(overrides.radii ?? {}).length > 0;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
      <div className="rounded-lg bg-primary-500/10 border border-primary-500/20 px-3 py-2 text-[10px] text-primary-400">
        Override theme tokens for this block. Empty values inherit the site theme.
      </div>

      <Section title="Colors">
        <div className="space-y-2.5">
          {COLOR_KEYS.map(({ key, label }) => (
            <PropertyRow key={key} label={label}>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={overrides.colors?.[key] ?? "#000000"}
                  onChange={(e) => updateColor(key, e.target.value)}
                  className="h-6 w-8 cursor-pointer rounded border-border bg-transparent"
                />
                <input
                  type="text"
                  value={overrides.colors?.[key] ?? ""}
                  onChange={(e) => updateColor(key, e.target.value)}
                  placeholder="Inherit"
                  className="flex-1 rounded-lg bg-muted/30 px-2 py-1.5 text-[11px] font-mono text-foreground outline-none ring-1 ring-border/50 transition-all focus:ring-primary-500/40"
                />
              </div>
            </PropertyRow>
          ))}
        </div>
      </Section>

      <Section title="Typography">
        <div className="space-y-2.5">
          {TYPOGRAPHY_KEYS.map(({ key, label }) => (
            <PropertyRow key={key} label={label}>
              <input
                type={key === "baseSize" ? "number" : "text"}
                value={overrides.typography?.[key] ?? ""}
                onChange={(e) => updateTypography(key, e.target.value)}
                placeholder="Inherit"
                className="w-full rounded-lg bg-muted/30 px-2 py-1.5 text-[11px] font-mono text-foreground outline-none ring-1 ring-border/50 transition-all focus:ring-primary-500/40"
              />
            </PropertyRow>
          ))}
        </div>
      </Section>

      <Section title="Border Radii">
        <div className="space-y-2.5">
          {RADII_KEYS.map(({ key, label }) => (
            <PropertyRow key={key} label={label}>
              <input
                type="text"
                value={overrides.radii?.[key] ?? ""}
                onChange={(e) => updateRadius(key, e.target.value)}
                placeholder="Inherit"
                className="w-full rounded-lg bg-muted/30 px-2 py-1.5 text-[11px] font-mono text-foreground outline-none ring-1 ring-border/50 transition-all focus:ring-primary-500/40"
              />
            </PropertyRow>
          ))}
        </div>
      </Section>

      {hasOverrides && (
        <div>
          <button
            onClick={clearOverrides}
            className="w-full rounded-lg border border-destructive/30 px-3 py-2 text-[10px] font-medium text-destructive hover:bg-destructive/10 transition-colors"
          >
            Clear All Overrides
          </button>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
        {title}
      </h4>
      <div className="space-y-2">{children}</div>
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
