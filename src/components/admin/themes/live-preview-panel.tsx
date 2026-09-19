"use client";

import { tokensToCssVars, type ThemeTokens } from "@/lib/theme/theme-converter";

interface LivePreviewPanelProps {
  tokens: ThemeTokens;
}

export function LivePreviewPanel({ tokens }: LivePreviewPanelProps) {
  const cssVars = tokensToCssVars(tokens);
  const style = cssVars as React.CSSProperties;

  return (
    <div
      className="overflow-hidden rounded-xl border"
      style={{
        ...style,
        backgroundColor: tokens.colors.background,
        color: tokens.colors.text,
        fontFamily: tokens.typography.bodyFont,
      }}
    >
      <div
        className="px-4 py-2 text-sm font-semibold"
        style={{ backgroundColor: tokens.colors.primary, color: tokens.colors.textOnPrimary }}
      >
        NEOT Preview
      </div>

      <div className="space-y-4 p-4">
        <h2
          className="text-xl font-bold"
          style={{ fontFamily: tokens.typography.headingFont, color: tokens.colors.text }}
        >
          Sample Heading
        </h2>
        <p className="text-sm" style={{ color: tokens.colors.textSecondary }}>
          This is sample body text showing how your theme will look.
        </p>

        <div className="flex gap-2">
          <span
            className="rounded px-3 py-1.5 text-xs font-medium"
            style={{ backgroundColor: tokens.colors.primary, color: tokens.colors.textOnPrimary, borderRadius: tokens.radii.md }}
          >
            Primary
          </span>
          <span
            className="rounded px-3 py-1.5 text-xs font-medium"
            style={{ backgroundColor: tokens.colors.secondary, color: tokens.colors.textOnPrimary, borderRadius: tokens.radii.md }}
          >
            Secondary
          </span>
          <span
            className="rounded px-3 py-1.5 text-xs font-medium"
            style={{ backgroundColor: tokens.colors.accent, color: tokens.colors.textOnPrimary, borderRadius: tokens.radii.md }}
          >
            Accent
          </span>
        </div>

        <div
          className="grid grid-cols-3 gap-2 rounded-lg p-3"
          style={{ backgroundColor: tokens.colors.backgroundAlt, borderRadius: tokens.radii.lg }}
        >
          {["Card 1", "Card 2", "Card 3"].map((card) => (
            <div
              key={card}
              className="rounded p-2 text-xs"
              style={{ backgroundColor: tokens.colors.surface, color: tokens.colors.text, borderRadius: tokens.radii.sm, borderColor: tokens.colors.border, borderWidth: 1 }}
            >
              {card}
            </div>
          ))}
        </div>

        <div
          className="h-2 w-full rounded-full"
          style={{ backgroundColor: tokens.colors.divider, borderRadius: tokens.radii.full }}
        >
          <div
            className="h-2 w-2/3 rounded-full"
            style={{ backgroundColor: tokens.colors.success, borderRadius: tokens.radii.full }}
          />
        </div>

        <div className="flex gap-2 text-xs" style={{ color: tokens.colors.textSecondary }}>
          <span style={{ color: tokens.colors.success }}>Success</span>
          <span style={{ color: tokens.colors.warning }}>Warning</span>
          <span style={{ color: tokens.colors.error }}>Error</span>
        </div>
      </div>
    </div>
  );
}
