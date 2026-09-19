"use client";

import { useEffect } from "react";
import { blockRegistry } from "@/lib/block-registry";
import { BlockOverlay } from "@/components/dev-mode/BlockOverlay";
import { useDevModeStore } from "@/stores/devModeStore";
import { usePageBuilderStore, type SectionType } from "@/stores/pageBuilderStore";

interface Section {
  id: string;
  blockType: string;
  content: Record<string, unknown>;
}

interface PageRendererProps {
  sections: Section[];
}

export function PageRenderer({ sections: initialSections }: PageRendererProps) {
  const enabled = useDevModeStore((s) => s.enabled);
  const { sections, setSections } = usePageBuilderStore();

  // Initialize store with server-side sections if dev mode is enabled
  useEffect(() => {
    if (enabled && sections.length === 0 && initialSections.length > 0) {
      setSections(initialSections.map(s => ({
        ...s,
        blockType: s.blockType as SectionType,
        pageId: "current",
        sortOrder: 0,
        settings: {}
      })));
    }
  }, [enabled, initialSections, setSections, sections.length]);

  const displaySections = enabled && sections.length > 0 ? sections : initialSections;

  if (!displaySections.length) return null;

  return (
    <>
      {displaySections.map((section) => {
        const Component = blockRegistry.getComponent(section.blockType);
        if (!Component) {
          return (
            <div
              key={section.id}
              className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground"
            >
              Unknown section type: <code className="text-sm">{section.blockType}</code>
            </div>
          );
        }

        const content = (
          <Component
            key={section.id}
            content={section.content}
            blockId={section.id}
          />
        );

        if (enabled) {
          return (
            <BlockOverlay
              key={section.id}
              blockId={section.id}
              label={section.blockType}
              path={`Page > ${section.blockType}`}
            >
              {content}
            </BlockOverlay>
          );
        }

        return content;
      })}
    </>
  );
}
