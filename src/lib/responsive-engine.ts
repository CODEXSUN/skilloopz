export const BREAKPOINTS = {
  desktop: { minWidth: 1025, label: "Desktop", icon: "Monitor" },
  tablet: { minWidth: 768, maxWidth: 1024, label: "Tablet", icon: "Tablet" },
  mobile: { minWidth: 320, maxWidth: 767, label: "Mobile", icon: "Smartphone" },
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

export interface StyleDeclaration {
  typography?: Record<string, string>;
  colors?: Record<string, string>;
  spacing?: Record<string, string>;
  effects?: Record<string, string>;
  layout?: Record<string, string>;
}

export type ResponsiveConfig = Partial<Record<Breakpoint, Partial<StyleDeclaration>>>;

export function resolveStyle(
  baseStyles: StyleDeclaration,
  responsiveStyles: ResponsiveConfig | undefined,
  breakpoint: Breakpoint,
): StyleDeclaration {
  if (!responsiveStyles?.[breakpoint]) return baseStyles;
  return mergeStyles(baseStyles, responsiveStyles[breakpoint]!);
}

function mergeStyles(base: StyleDeclaration, override: Partial<StyleDeclaration>): StyleDeclaration {
  const result: StyleDeclaration = { ...base };

  for (const category of Object.keys(override) as (keyof StyleDeclaration)[]) {
    result[category] = { ...base[category], ...override[category] };
  }

  return result;
}
