"use client";

import { useState } from "react";

import { useDevModeStore } from "@/stores/devModeStore";
import { editorRegistry } from "@/lib/editor-registry";
import { MotionTab } from "./section-editors/motion-tab";
import { InteractionsTab } from "./section-editors/interactions-tab";
import { StyleTab } from "./section-editors/style-tab";
import { EffectsTab } from "./section-editors/effects-tab";
import { DataBindingTab } from "./section-editors/data-binding-tab";
import { AccessibilityTab } from "./section-editors/accessibility-tab";
import { SEOTab } from "./section-editors/seo-tab";
import { VisibilityRulesTab } from "./section-editors/visibility-rules-tab";
import { GlobalStylesTab } from "./section-editors/global-styles-tab";

interface PropertiesPanelProps {
  selectedBlock: {
    id: string;
    type: string;
    label: string;
    content: Record<string, unknown>;
    styles?: Record<string, unknown>;
  } | null;
  onContentChange?: (id: string, content: Record<string, unknown>) => void;
  onStyleChange?: (id: string, styles: Record<string, unknown>) => void;
}

type Tab = "content" | "style" | "motion" | "effects" | "interactions" | "data" | "a11y" | "seo" | "rules" | "theme";

const allTabs: { key: Tab; label: string }[] = [
  { key: "content", label: "content" },
  { key: "style", label: "style" },
  { key: "motion", label: "motion" },
  { key: "effects", label: "effects" },
  { key: "interactions", label: "int" },
  { key: "data", label: "data" },
  { key: "a11y", label: "a11y" },
  { key: "seo", label: "seo" },
  { key: "rules", label: "rules" },
  { key: "theme", label: "theme" },
];

export function PropertiesPanel({ selectedBlock, onContentChange, onStyleChange }: PropertiesPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>("content");
  const enabled = useDevModeStore((s) => s.enabled);

  if (!enabled) return null;

  if (!selectedBlock) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/30 border border-border">
          <span className="text-xl">✨</span>
        </div>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">Select an element to edit</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-background/50 backdrop-blur-xl">
      <div className="border-b border-border p-5">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-500 text-[11px] font-bold text-white shadow-glow-sm">
            {selectedBlock.type[0].toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                {selectedBlock.type}
              </p>
            </div>
            <p className="text-sm font-bold text-foreground">{selectedBlock.label}</p>
          </div>
        </div>

        <div className="flex gap-1 overflow-x-auto rounded-xl bg-muted/20 p-1 border border-border/50 custom-scrollbar">
          {allTabs.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`shrink-0 rounded-lg px-2 py-1.5 text-[9px] font-bold uppercase tracking-wider transition-all ${
                activeTab === key 
                  ? "bg-background text-foreground shadow-sm ring-1 ring-black/5" 
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 custom-scrollbar space-y-8">
        {activeTab === "content" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-2 duration-300">
            {(() => {
              const SectionEditor = editorRegistry.get(selectedBlock.type);
              if (SectionEditor) {
                return (
                  <SectionEditor
                    content={selectedBlock.content}
                    onChange={(newContent) => onContentChange?.(selectedBlock.id, newContent)}
                  />
                );
              }
              return (
                <Section title="Main Content">
                  {Object.entries(selectedBlock.content).length === 0 ? (
                    <p className="text-xs text-muted-foreground">No content fields</p>
                  ) : (
                    Object.entries(selectedBlock.content).map(([key, val]) => (
                      <PropertyRow key={key} label={key}>
                        {typeof val === "boolean" ? (
                          <input
                            type="checkbox"
                            checked={val}
                            onChange={(e) => {
                              onContentChange?.(selectedBlock.id, {
                                ...selectedBlock.content,
                                [key]: e.target.checked,
                              });
                            }}
                            className="h-4 w-4 rounded border-border bg-muted/30 text-primary-500"
                          />
                        ) : (
                          <input
                            type="text"
                            value={String(val ?? "")}
                            onChange={(e) => {
                              onContentChange?.(selectedBlock.id, {
                                ...selectedBlock.content,
                                [key]: e.target.value,
                              });
                            }}
                            className="w-full rounded-lg bg-muted/30 px-3 py-2 text-[11px] font-medium text-foreground outline-none ring-1 ring-border/50 transition-all focus:ring-primary-500/40 focus:bg-background"
                          />
                        )}
                      </PropertyRow>
                    ))
                  )}
                </Section>
              );
            })()}
          </div>
        )}

        {activeTab === "style" && (
          <StyleTab sectionId={selectedBlock.id} />
        )}

        {activeTab === "motion" && (
          <MotionTab sectionId={selectedBlock.id} />
        )}

        {activeTab === "effects" && (
          <EffectsTab sectionId={selectedBlock.id} />
        )}

        {activeTab === "interactions" && (
          <InteractionsTab sectionId={selectedBlock.id} />
        )}

        {activeTab === "data" && (
          <DataBindingTab sectionId={selectedBlock.id} />
        )}

        {activeTab === "a11y" && (
          <AccessibilityTab sectionId={selectedBlock.id} />
        )}

        {activeTab === "seo" && (
          <SEOTab sectionId={selectedBlock.id} />
        )}

        {activeTab === "rules" && (
          <VisibilityRulesTab sectionId={selectedBlock.id} />
        )}

        {activeTab === "theme" && (
          <GlobalStylesTab sectionId={selectedBlock.id} />
        )}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="mb-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
        {title}
      </h4>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function PropertyRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-muted-foreground min-w-[72px]">{label}</span>
      <div className="flex-1">{children}</div>
    </div>
  );
}
