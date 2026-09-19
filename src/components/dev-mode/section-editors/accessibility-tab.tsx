"use client";

import { useState } from "react";
import { usePageBuilderStore } from "@/stores/pageBuilderStore";

interface AccessibilityTabProps {
  sectionId: string;
}

type A11yConfig = {
  ariaLabel?: string;
  ariaDescribedby?: string;
  role?: string;
  tabIndex?: number;
  keyboardShortcut?: string;
  liveRegion?: "off" | "polite" | "assertive";
  ariaHidden?: boolean;
  rolePreset?: string;
};

const rolePresets = [
  { value: "", label: "None (auto)" },
  { value: "button", label: "Button" },
  { value: "link", label: "Link" },
  { value: "heading", label: "Heading" },
  { value: "img", label: "Image" },
  { value: "list", label: "List" },
  { value: "listitem", label: "List Item" },
  { value: "navigation", label: "Navigation" },
  { value: "banner", label: "Banner" },
  { value: "main", label: "Main" },
  { value: "complementary", label: "Complementary" },
  { value: "contentinfo", label: "Content Info" },
  { value: "form", label: "Form" },
  { value: "search", label: "Search" },
  { value: "dialog", label: "Dialog" },
  { value: "tabpanel", label: "Tab Panel" },
  { value: "region", label: "Region" },
];

export function AccessibilityTab({ sectionId }: AccessibilityTabProps) {
  const updateSection = usePageBuilderStore((s) => s.updateSection);
  const section = usePageBuilderStore((s) => s.sections.find((sec) => sec.id === sectionId));
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const a11y = (section?.settings?.accessibility as A11yConfig) ?? {};

  const toggle = (key: string) => setCollapsed((p) => ({ ...p, [key]: !p[key] }));

  const update = (partial: Partial<A11yConfig>) => {
    const sec = usePageBuilderStore.getState().sections.find((s) => s.id === sectionId);
    if (!sec) return;
    updateSection(sectionId, {
      settings: {
        ...sec.settings,
        accessibility: { ...a11y, ...partial },
      },
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
      <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 text-[10px] text-emerald-400">
        Configure ARIA attributes and semantic roles for this section.
      </div>

      <Section title="Semantic Role" collapsed={collapsed} onToggle={toggle}>
        <PropertyRow label="Role">
          <select
            value={a11y.rolePreset ?? a11y.role ?? ""}
            onChange={(e) => update({ rolePreset: e.target.value, role: e.target.value || undefined })}
            className="w-full rounded-lg bg-muted/30 px-2 py-1.5 text-[11px] font-medium text-foreground outline-none ring-1 ring-border/50"
          >
            {rolePresets.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </PropertyRow>
        <PropertyRow label="Custom role">
          <input
            type="text"
            value={a11y.role ?? ""}
            onChange={(e) => update({ role: e.target.value || undefined })}
            placeholder="e.g. tab"
            className="w-full rounded-lg bg-muted/30 px-2 py-1.5 text-[11px] font-mono text-foreground outline-none ring-1 ring-border/50"
          />
        </PropertyRow>
      </Section>

      <Section title="ARIA Attributes" collapsed={collapsed} onToggle={toggle}>
        <PropertyRow label="aria-label">
          <input
            type="text"
            value={a11y.ariaLabel ?? ""}
            onChange={(e) => update({ ariaLabel: e.target.value || undefined })}
            placeholder="Descriptive label"
            className="w-full rounded-lg bg-muted/30 px-2 py-1.5 text-[11px] font-mono text-foreground outline-none ring-1 ring-border/50"
          />
        </PropertyRow>
        <PropertyRow label="aria-describedby">
          <input
            type="text"
            value={a11y.ariaDescribedby ?? ""}
            onChange={(e) => update({ ariaDescribedby: e.target.value || undefined })}
            placeholder="Element ID"
            className="w-full rounded-lg bg-muted/30 px-2 py-1.5 text-[11px] font-mono text-foreground outline-none ring-1 ring-border/50"
          />
        </PropertyRow>
        <PropertyRow label="aria-hidden">
          <input
            type="checkbox"
            checked={a11y.ariaHidden ?? false}
            onChange={(e) => update({ ariaHidden: e.target.checked || undefined })}
            className="h-4 w-4 rounded border-border bg-muted/30 text-primary-500"
          />
        </PropertyRow>
        <PropertyRow label="Live Region">
          <select
            value={a11y.liveRegion ?? "off"}
            onChange={(e) => update({ liveRegion: e.target.value as "off" | "polite" | "assertive" })}
            className="w-full rounded-lg bg-muted/30 px-2 py-1.5 text-[11px] font-medium text-foreground outline-none ring-1 ring-border/50"
          >
            <option value="off">Off</option>
            <option value="polite">Polite</option>
            <option value="assertive">Assertive</option>
          </select>
        </PropertyRow>
      </Section>

      <Section title="Keyboard" collapsed={collapsed} onToggle={toggle}>
        <PropertyRow label="Tab Index">
          <select
            value={a11y.tabIndex ?? 0}
            onChange={(e) => update({ tabIndex: parseInt(e.target.value, 10) })}
            className="w-full rounded-lg bg-muted/30 px-2 py-1.5 text-[11px] font-medium text-foreground outline-none ring-1 ring-border/50"
          >
            <option value={0}>0 (natural order)</option>
            <option value={-1}>-1 (not focusable)</option>
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={4}>4</option>
            <option value={5}>5</option>
            <option value={6}>6</option>
            <option value={7}>7</option>
            <option value={8}>8</option>
            <option value={9}>9</option>
            <option value={10}>10</option>
          </select>
        </PropertyRow>
        <PropertyRow label="Shortcut">
          <input
            type="text"
            value={a11y.keyboardShortcut ?? ""}
            onChange={(e) => update({ keyboardShortcut: e.target.value || undefined })}
            placeholder="e.g. Alt+N"
            className="w-full rounded-lg bg-muted/30 px-2 py-1.5 text-[11px] font-mono text-foreground outline-none ring-1 ring-border/50"
          />
        </PropertyRow>
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
