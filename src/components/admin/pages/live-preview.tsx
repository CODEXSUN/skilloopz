"use client";

import { usePageBuilderStore } from "@/stores/pageBuilderStore";
import { useDevModeStore, type DeviceMode } from "@/stores/devModeStore";
import { BlockOverlay } from "@/components/dev-mode/BlockOverlay";
import { PublicHeader } from "@/components/layout/public-header";
import { DataBoundRenderer } from "@/components/blocks/data-bound-renderer";
import { overridesToCssVars } from "@/lib/theme/theme-converter";

const deviceWidths: Record<DeviceMode, string> = {
  desktop: "100%",
  tablet: "768px",
  mobile: "375px",
};

export function LivePreview() {
  const { sections } = usePageBuilderStore();
  const deviceMode = useDevModeStore((s) => s.deviceMode);

  return (
    <div className="flex min-h-full justify-center bg-background text-foreground">
      <div
        className="relative w-full"
        style={{ maxWidth: deviceWidths[deviceMode] }}
      >
        <PublicHeader />
        {deviceMode !== "desktop" && (
          <div className="sticky top-[80px] z-[100] flex items-center justify-center border-b border-border bg-background py-1">
            <span className="text-[10px] text-muted-foreground">
              {deviceMode === "tablet" ? "768px — Tablet" : "375px — Mobile"}
            </span>
          </div>
        )}
        <div className="pt-[100px]">
          {sections
            .filter((section) => !section.settings.hidden)
            .map((section) => (
            <BlockOverlay
              key={section.id}
              blockId={section.id}
              label={section.blockType}
              path={`Page > ${section.blockType}`}
            >
              <div style={overridesToCssVars(section.settings.themeOverrides as Record<string, unknown> | undefined)}>
                <DataBoundRenderer section={section} />
              </div>
            </BlockOverlay>
          ))}
          {sections.length === 0 && (
            <div className="flex items-center justify-center py-32 text-sm text-muted-foreground">
              Add sections to start building
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
