"use client";

import { useState } from "react";
import { usePageBuilderStore } from "@/stores/pageBuilderStore";
import type { DataSourceType } from "@/lib/data-binding";

interface DataBindingTabProps {
  sectionId: string;
}

type DataBindingConfig = {
  sourceType: DataSourceType;
  filters?: Record<string, string>;
  limit?: number;
  fieldMapping?: Record<string, string>;
  cacheDuration?: number;
  fallbackDisplay?: string;
  sortField?: string;
  sortOrder?: "asc" | "desc";
};

const sourceOptions: { value: DataSourceType; label: string }[] = [
  { value: "courses", label: "Courses" },
  { value: "users", label: "Users" },
  { value: "categories", label: "Categories" },
  { value: "enrollments", label: "Enrollments" },
  { value: "lessons", label: "Lessons" },
  { value: "analytics", label: "Analytics" },
];

export function DataBindingTab({ sectionId }: DataBindingTabProps) {
  const updateSection = usePageBuilderStore((s) => s.updateSection);
  const section = usePageBuilderStore((s) => s.sections.find((sec) => sec.id === sectionId));
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const db = (section?.settings?.dataBinding as DataBindingConfig) ?? {};
  const hasBinding = !!db.sourceType;

  const toggle = (key: string) => setCollapsed((p) => ({ ...p, [key]: !p[key] }));

  const update = (partial: Partial<DataBindingConfig>) => {
    const sec = usePageBuilderStore.getState().sections.find((s) => s.id === sectionId);
    if (!sec) return;
    updateSection(sectionId, {
      settings: {
        ...sec.settings,
        dataBinding: { ...db, ...partial },
      },
    });
  };

  const removeBinding = () => {
    const sec = usePageBuilderStore.getState().sections.find((s) => s.id === sectionId);
    if (!sec) return;
    const { dataBinding: _, ...rest } = sec.settings as Record<string, unknown> & { dataBinding?: DataBindingConfig };
    updateSection(sectionId, { settings: rest });
  };

  const [filterKey, setFilterKey] = useState("");
  const [filterVal, setFilterVal] = useState("");

  const addFilter = () => {
    if (!filterKey) return;
    update({ filters: { ...db.filters, [filterKey]: filterVal } });
    setFilterKey("");
    setFilterVal("");
  };

  const removeFilter = (key: string) => {
    const { [key]: _, ...rest } = db.filters ?? {};
    update({ filters: rest });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
      <div className="rounded-lg bg-primary-500/10 border border-primary-500/20 px-3 py-2 text-[10px] text-primary-400">
        Bind this section to a dynamic data source. Content will be resolved at render time.
      </div>

      <Section title="Data Source" collapsed={collapsed} onToggle={toggle}>
        <PropertyRow label="Source">
          <select
            value={db.sourceType ?? ""}
            onChange={(e) => update({ sourceType: e.target.value as DataSourceType })}
            className="w-full rounded-lg bg-muted/30 px-2 py-1.5 text-[11px] font-medium text-foreground outline-none ring-1 ring-border/50"
          >
            <option value="">— None —</option>
            {sourceOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </PropertyRow>

        {hasBinding && (
          <>
            <PropertyRow label="Limit">
              <input
                type="number" min={1}
                value={db.limit ?? ""}
                onChange={(e) => update({ limit: e.target.value ? parseInt(e.target.value, 10) : undefined })}
                placeholder="No limit"
                className="w-full rounded-lg bg-muted/30 px-2 py-1.5 text-[11px] font-mono text-foreground outline-none ring-1 ring-border/50"
              />
            </PropertyRow>

            <PropertyRow label="Sort Field">
              <input
                type="text"
                value={db.sortField ?? ""}
                onChange={(e) => update({ sortField: e.target.value || undefined })}
                placeholder="e.g. createdAt"
                className="w-full rounded-lg bg-muted/30 px-2 py-1.5 text-[11px] font-mono text-foreground outline-none ring-1 ring-border/50"
              />
            </PropertyRow>

            <PropertyRow label="Sort Order">
              <select
                value={db.sortOrder ?? "desc"}
                onChange={(e) => update({ sortOrder: e.target.value as "asc" | "desc" })}
                className="w-full rounded-lg bg-muted/30 px-2 py-1.5 text-[11px] font-medium text-foreground outline-none ring-1 ring-border/50"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </PropertyRow>
          </>
        )}
      </Section>

      {hasBinding && (
        <Section title="Filters" collapsed={collapsed} onToggle={toggle}>
          {db.filters && Object.entries(db.filters).length > 0 ? (
            <div className="space-y-1.5 mb-3">
              {Object.entries(db.filters).map(([key, val]) => (
                <div key={key} className="flex items-center gap-1.5">
                  <span className="rounded bg-muted/30 px-1.5 py-0.5 text-[10px] font-mono text-foreground">
                    {key}
                  </span>
                  <span className="text-[10px] text-muted-foreground">=</span>
                  <span className="rounded bg-muted/30 px-1.5 py-0.5 text-[10px] font-mono text-foreground">
                    {String(val)}
                  </span>
                  <button
                    onClick={() => removeFilter(key)}
                    className="ml-auto text-[10px] text-destructive hover:text-destructive/80"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[10px] text-muted-foreground mb-3">No filters configured</p>
          )}
          <div className="flex items-center gap-1.5">
            <input
              type="text" value={filterKey}
              onChange={(e) => setFilterKey(e.target.value)}
              placeholder="key"
              className="w-16 rounded-md bg-muted/30 px-1.5 py-1 text-[10px] font-mono text-foreground outline-none ring-1 ring-border/50"
            />
            <input
              type="text" value={filterVal}
              onChange={(e) => setFilterVal(e.target.value)}
              placeholder="value"
              className="flex-1 rounded-md bg-muted/30 px-1.5 py-1 text-[10px] font-mono text-foreground outline-none ring-1 ring-border/50"
            />
            <button
              onClick={addFilter}
              disabled={!filterKey}
              className="rounded-md bg-primary-500/20 px-2 py-1 text-[10px] font-medium text-primary-400 hover:bg-primary-500/30 disabled:opacity-40"
            >
              Add
            </button>
          </div>
        </Section>
      )}

      {hasBinding && (
        <Section title="Field Mapping" collapsed={collapsed} onToggle={toggle}>
          <p className="text-[10px] text-muted-foreground mb-2">
            Map data source fields to section content properties.
          </p>
          <div className="space-y-2">
            {Object.entries(db.fieldMapping ?? {}).map(([sectionField, dataField]) => (
              <div key={sectionField} className="flex items-center gap-1.5">
                <span className="rounded bg-muted/30 px-1.5 py-0.5 text-[10px] font-mono text-foreground">
                  {sectionField}
                </span>
                <span className="text-[10px] text-muted-foreground">←</span>
                <span className="rounded bg-primary-500/10 px-1.5 py-0.5 text-[10px] font-mono text-primary-400">
                  {dataField}
                </span>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground mt-2">
            Field mapping will be extended when the data engine processes results.
          </p>
        </Section>
      )}

      {hasBinding && (
        <Section title="Cache" collapsed={collapsed} onToggle={toggle}>
          <PropertyRow label="Duration (s)">
            <input
              type="number" min={0}
              value={db.cacheDuration ?? ""}
              onChange={(e) => update({ cacheDuration: e.target.value ? parseInt(e.target.value, 10) : undefined })}
              placeholder="No cache"
              className="w-full rounded-lg bg-muted/30 px-2 py-1.5 text-[11px] font-mono text-foreground outline-none ring-1 ring-border/50"
            />
          </PropertyRow>
        </Section>
      )}

      {hasBinding && (
        <Section title="Fallback" collapsed={collapsed} onToggle={toggle}>
          <PropertyRow label="Empty state">
            <input
              type="text"
              value={db.fallbackDisplay ?? ""}
              onChange={(e) => update({ fallbackDisplay: e.target.value || undefined })}
              placeholder="No data available"
              className="w-full rounded-lg bg-muted/30 px-2 py-1.5 text-[11px] font-medium text-foreground outline-none ring-1 ring-border/50"
            />
          </PropertyRow>
        </Section>
      )}

      {hasBinding && (
        <div>
          <button
            onClick={removeBinding}
            className="w-full rounded-lg border border-destructive/30 px-3 py-2 text-[10px] font-medium text-destructive hover:bg-destructive/10 transition-colors"
          >
            Remove Data Binding
          </button>
        </div>
      )}
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
