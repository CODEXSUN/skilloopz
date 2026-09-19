"use client";

import { useState } from "react";
import { usePageBuilderStore } from "@/stores/pageBuilderStore";

interface VisibilityRulesTabProps {
  sectionId: string;
}

type VisibilityConfig = {
  showForAuth?: "all" | "loggedIn" | "loggedOut";
  showForRoles?: string[];
  hideOnDevices?: string[];
  showFromDate?: string;
  showToDate?: string;
  customCondition?: string;
};

const roleOptions = ["admin", "teacher", "student", "parent"];
const deviceOptions = ["mobile", "tablet", "desktop"];

export function VisibilityRulesTab({ sectionId }: VisibilityRulesTabProps) {
  const updateSection = usePageBuilderStore((s) => s.updateSection);
  const section = usePageBuilderStore((s) => s.sections.find((sec) => sec.id === sectionId));
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const vis = (section?.settings?.visibility as VisibilityConfig) ?? {};

  const toggle = (key: string) => setCollapsed((p) => ({ ...p, [key]: !p[key] }));

  const update = (partial: Partial<VisibilityConfig>) => {
    const sec = usePageBuilderStore.getState().sections.find((s) => s.id === sectionId);
    if (!sec) return;
    updateSection(sectionId, {
      settings: {
        ...sec.settings,
        visibility: { ...vis, ...partial },
      },
    });
  };

  const toggleRole = (role: string) => {
    const current = vis.showForRoles ?? [];
    const next = current.includes(role)
      ? current.filter((r) => r !== role)
      : [...current, role];
    update({ showForRoles: next.length > 0 ? next : undefined });
  };

  const toggleDevice = (device: string) => {
    const current = vis.hideOnDevices ?? [];
    const next = current.includes(device)
      ? current.filter((d) => d !== device)
      : [...current, device];
    update({ hideOnDevices: next.length > 0 ? next : undefined });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
      <div className="rounded-lg bg-violet-500/10 border border-violet-500/20 px-3 py-2 text-[10px] text-violet-400">
        Control when this section is visible. All conditions are AND-ed together.
      </div>

      <Section title="Authentication" collapsed={collapsed} onToggle={toggle}>
        <PropertyRow label="Show for">
          <select
            value={vis.showForAuth ?? "all"}
            onChange={(e) => update({ showForAuth: e.target.value as "all" | "loggedIn" | "loggedOut" })}
            className="w-full rounded-lg bg-muted/30 px-2 py-1.5 text-[11px] font-medium text-foreground outline-none ring-1 ring-border/50"
          >
            <option value="all">Everyone</option>
            <option value="loggedIn">Logged-in only</option>
            <option value="loggedOut">Logged-out only</option>
          </select>
        </PropertyRow>
      </Section>

      <Section title="User Roles" collapsed={collapsed} onToggle={toggle}>
        <p className="text-[10px] text-muted-foreground mb-2">Visible only to selected roles (leave empty for all).</p>
        <div className="flex flex-wrap gap-1.5">
          {roleOptions.map((role) => {
            const active = vis.showForRoles?.includes(role) ?? false;
            return (
              <button
                key={role}
                onClick={() => toggleRole(role)}
                className={`rounded-md px-2 py-1 text-[10px] font-medium transition-colors ${
                  active
                    ? "bg-primary-500/20 text-primary-400 ring-1 ring-primary-500/30"
                    : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
                }`}
              >
                {role}
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Device" collapsed={collapsed} onToggle={toggle}>
        <p className="text-[10px] text-muted-foreground mb-2">Hide on selected devices.</p>
        <div className="flex flex-wrap gap-1.5">
          {deviceOptions.map((device) => {
            const active = vis.hideOnDevices?.includes(device) ?? false;
            return (
              <button
                key={device}
                onClick={() => toggleDevice(device)}
                className={`rounded-md px-2 py-1 text-[10px] font-medium transition-colors ${
                  active
                    ? "bg-destructive/20 text-destructive ring-1 ring-destructive/30"
                    : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
                }`}
              >
                {active ? `Hide on ${device}` : device}
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Date Range" collapsed={collapsed} onToggle={toggle}>
        <PropertyRow label="Visible from">
          <input
            type="date"
            value={vis.showFromDate ?? ""}
            onChange={(e) => update({ showFromDate: e.target.value || undefined })}
            className="w-full rounded-lg bg-muted/30 px-2 py-1.5 text-[11px] font-mono text-foreground outline-none ring-1 ring-border/50"
          />
        </PropertyRow>
        <PropertyRow label="Visible until">
          <input
            type="date"
            value={vis.showToDate ?? ""}
            onChange={(e) => update({ showToDate: e.target.value || undefined })}
            className="w-full rounded-lg bg-muted/30 px-2 py-1.5 text-[11px] font-mono text-foreground outline-none ring-1 ring-border/50"
          />
        </PropertyRow>
      </Section>

      <Section title="Custom Expression" collapsed={collapsed} onToggle={toggle}>
        <PropertyRow label="Condition">
          <input
            type="text"
            value={vis.customCondition ?? ""}
            onChange={(e) => update({ customCondition: e.target.value || undefined })}
            placeholder="e.g. user.xp > 1000"
            className="w-full rounded-lg bg-muted/30 px-2 py-1.5 text-[11px] font-mono text-foreground outline-none ring-1 ring-border/50"
          />
        </PropertyRow>
        <p className="text-[10px] text-muted-foreground mt-1">
          Evaluated at render time. Access user context, feature flags, and store state.
        </p>
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
