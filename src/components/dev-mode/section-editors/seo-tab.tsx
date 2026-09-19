"use client";

import { useState } from "react";
import { usePageBuilderStore } from "@/stores/pageBuilderStore";

interface SEOTabProps {
  sectionId: string;
}

type SEOConfig = {
  metaTitle?: string;
  metaDescription?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonicalUrl?: string;
  structuredData?: string;
  robotsNoindex?: boolean;
  robotsNofollow?: boolean;
  priority?: number;
  changeFreq?: string;
};

const changeFreqs = [
  "always", "hourly", "daily", "weekly", "monthly", "yearly", "never",
];

export function SEOTab({ sectionId }: SEOTabProps) {
  const updateSection = usePageBuilderStore((s) => s.updateSection);
  const section = usePageBuilderStore((s) => s.sections.find((sec) => sec.id === sectionId));
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const seo = (section?.settings?.seo as SEOConfig) ?? {};

  const toggle = (key: string) => setCollapsed((p) => ({ ...p, [key]: !p[key] }));

  const update = (partial: Partial<SEOConfig>) => {
    const sec = usePageBuilderStore.getState().sections.find((s) => s.id === sectionId);
    if (!sec) return;
    updateSection(sectionId, {
      settings: {
        ...sec.settings,
        seo: { ...seo, ...partial },
      },
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
      <div className="rounded-lg bg-sky-500/10 border border-sky-500/20 px-3 py-2 text-[10px] text-sky-400">
        Configure search engine and social media metadata for this section/page.
      </div>

      <Section title="Meta Tags" collapsed={collapsed} onToggle={toggle}>
        <PropertyRow label="Title">
          <input
            type="text"
            value={seo.metaTitle ?? ""}
            onChange={(e) => update({ metaTitle: e.target.value || undefined })}
            placeholder="Page title"
            className="w-full rounded-lg bg-muted/30 px-2 py-1.5 text-[11px] font-mono text-foreground outline-none ring-1 ring-border/50"
          />
        </PropertyRow>
        <PropertyRow label="Description">
          <textarea
            value={seo.metaDescription ?? ""}
            onChange={(e) => update({ metaDescription: e.target.value || undefined })}
            placeholder="Meta description"
            rows={2}
            className="w-full rounded-lg bg-muted/30 px-2 py-1.5 text-[11px] font-mono text-foreground outline-none ring-1 ring-border/50 resize-none"
          />
        </PropertyRow>
        <PropertyRow label="Canonical URL">
          <input
            type="text"
            value={seo.canonicalUrl ?? ""}
            onChange={(e) => update({ canonicalUrl: e.target.value || undefined })}
            placeholder="https://example.com/page"
            className="w-full rounded-lg bg-muted/30 px-2 py-1.5 text-[11px] font-mono text-foreground outline-none ring-1 ring-border/50"
          />
        </PropertyRow>
      </Section>

      <Section title="Open Graph" collapsed={collapsed} onToggle={toggle}>
        <PropertyRow label="OG Title">
          <input
            type="text"
            value={seo.ogTitle ?? ""}
            onChange={(e) => update({ ogTitle: e.target.value || undefined })}
            placeholder="Overrides meta title"
            className="w-full rounded-lg bg-muted/30 px-2 py-1.5 text-[11px] font-mono text-foreground outline-none ring-1 ring-border/50"
          />
        </PropertyRow>
        <PropertyRow label="OG Description">
          <textarea
            value={seo.ogDescription ?? ""}
            onChange={(e) => update({ ogDescription: e.target.value || undefined })}
            placeholder="Overrides meta description"
            rows={2}
            className="w-full rounded-lg bg-muted/30 px-2 py-1.5 text-[11px] font-mono text-foreground outline-none ring-1 ring-border/50 resize-none"
          />
        </PropertyRow>
        <PropertyRow label="OG Image">
          <input
            type="text"
            value={seo.ogImage ?? ""}
            onChange={(e) => update({ ogImage: e.target.value || undefined })}
            placeholder="https://example.com/image.jpg"
            className="w-full rounded-lg bg-muted/30 px-2 py-1.5 text-[11px] font-mono text-foreground outline-none ring-1 ring-border/50"
          />
        </PropertyRow>
      </Section>

      <Section title="Robots" collapsed={collapsed} onToggle={toggle}>
        <PropertyRow label="noindex">
          <input
            type="checkbox"
            checked={seo.robotsNoindex ?? false}
            onChange={(e) => update({ robotsNoindex: e.target.checked || undefined })}
            className="h-4 w-4 rounded border-border bg-muted/30 text-primary-500"
          />
        </PropertyRow>
        <PropertyRow label="nofollow">
          <input
            type="checkbox"
            checked={seo.robotsNofollow ?? false}
            onChange={(e) => update({ robotsNofollow: e.target.checked || undefined })}
            className="h-4 w-4 rounded border-border bg-muted/30 text-primary-500"
          />
        </PropertyRow>
      </Section>

      <Section title="Sitemap" collapsed={collapsed} onToggle={toggle}>
        <PropertyRow label="Priority">
          <div className="flex items-center gap-2">
            <input
              type="range" min="0" max="1" step="0.1"
              value={seo.priority ?? 0.5}
              onChange={(e) => update({ priority: parseFloat(e.target.value) })}
              className="h-1 flex-1 appearance-none rounded-full bg-muted accent-primary-500 cursor-pointer"
            />
            <span className="text-[10px] text-muted-foreground min-w-[3ch]">{seo.priority ?? 0.5}</span>
          </div>
        </PropertyRow>
        <PropertyRow label="Change Freq">
          <select
            value={seo.changeFreq ?? "weekly"}
            onChange={(e) => update({ changeFreq: e.target.value })}
            className="w-full rounded-lg bg-muted/30 px-2 py-1.5 text-[11px] font-medium text-foreground outline-none ring-1 ring-border/50"
          >
            {changeFreqs.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </PropertyRow>
      </Section>

      <Section title="Structured Data" collapsed={collapsed} onToggle={toggle}>
        <PropertyRow label="JSON-LD">
          <textarea
            value={seo.structuredData ?? ""}
            onChange={(e) => update({ structuredData: e.target.value || undefined })}
            placeholder='{"@context":"https://schema.org",...}'
            rows={4}
            className="w-full rounded-lg bg-muted/30 px-2 py-1.5 text-[11px] font-mono text-foreground outline-none ring-1 ring-border/50 resize-none"
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
