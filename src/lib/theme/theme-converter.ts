export interface ThemeTokens {
  colors: {
    primary: string;
    primaryLight: string;
    primaryDark: string;
    secondary: string;
    accent: string;
    background: string;
    backgroundAlt: string;
    surface: string;
    text: string;
    textSecondary: string;
    textOnPrimary: string;
    success: string;
    warning: string;
    error: string;
    border: string;
    divider: string;
    shadow: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
    baseSize: number;
  };
  radii: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
  };
  animations: {
    default: string;
    duration: number;
    pageTransition: string;
  };
}

const defaultTokens: ThemeTokens = {
  colors: {
    primary: "#7c3aed",
    primaryLight: "#a78bfa",
    primaryDark: "#5b21b6",
    secondary: "#06b6d4",
    accent: "#f59e0b",
    background: "#ffffff",
    backgroundAlt: "#f9fafb",
    surface: "#ffffff",
    text: "#111827",
    textSecondary: "#6b7280",
    textOnPrimary: "#ffffff",
    success: "#10b981",
    warning: "#f59e0b",
    error: "#ef4444",
    border: "#e5e7eb",
    divider: "#e5e7eb",
    shadow: "#00000010",
  },
  typography: {
    headingFont: "'Inter', sans-serif",
    bodyFont: "'Inter', sans-serif",
    baseSize: 16,
  },
  radii: {
    sm: "4px",
    md: "8px",
    lg: "12px",
    xl: "16px",
    full: "9999px",
  },
  animations: {
    default: "ease-in-out",
    duration: 200,
    pageTransition: "0.3s ease-in-out",
  },
};

export function parseTokens(raw: string | Record<string, unknown>): ThemeTokens {
  try {
    const data = typeof raw === "string" ? JSON.parse(raw) : raw;
    return {
      colors: { ...defaultTokens.colors, ...data.colors },
      typography: { ...defaultTokens.typography, ...data.typography },
      radii: { ...defaultTokens.radii, ...data.radii },
      animations: { ...defaultTokens.animations, ...data.animations },
    };
  } catch {
    return defaultTokens;
  }
}

export function tokensToCssVars(tokens: ThemeTokens): Record<string, string> {
  return {
    "--color-primary": tokens.colors.primary,
    "--color-primary-light": tokens.colors.primaryLight,
    "--color-primary-dark": tokens.colors.primaryDark,
    "--color-secondary": tokens.colors.secondary,
    "--color-accent": tokens.colors.accent,
    "--color-background": tokens.colors.background,
    "--color-background-alt": tokens.colors.backgroundAlt,
    "--color-surface": tokens.colors.surface,
    "--color-text": tokens.colors.text,
    "--color-text-secondary": tokens.colors.textSecondary,
    "--color-text-on-primary": tokens.colors.textOnPrimary,
    "--color-success": tokens.colors.success,
    "--color-warning": tokens.colors.warning,
    "--color-error": tokens.colors.error,
    "--color-border": tokens.colors.border,
    "--color-divider": tokens.colors.divider,
    "--color-shadow": tokens.colors.shadow,
    "--font-heading": tokens.typography.headingFont,
    "--font-body": tokens.typography.bodyFont,
    "--font-size-base": `${tokens.typography.baseSize}px`,
    "--radius-sm": tokens.radii.sm,
    "--radius-md": tokens.radii.md,
    "--radius-lg": tokens.radii.lg,
    "--radius-xl": tokens.radii.xl,
    "--radius-full": tokens.radii.full,
    "--animation-default": tokens.animations.default,
    "--animation-duration": `${tokens.animations.duration}ms`,
    "--animation-page-transition": tokens.animations.pageTransition,
  };
}

export function overridesToCssVars(
  overrides: Record<string, unknown> | undefined | null,
): Record<string, string> {
  const vars: Record<string, string> = {};
  if (!overrides) return vars;

  const themeOverrides = overrides as {
    colors?: Record<string, string>;
    typography?: Record<string, string>;
    radii?: Record<string, string>;
  };

  if (themeOverrides.colors) {
    for (const [key, val] of Object.entries(themeOverrides.colors)) {
      if (val) {
        const k = key.replace(/([A-Z])/g, "-$1").toLowerCase();
        vars[`--color-${k}`] = val;
      }
    }
  }
  if (themeOverrides.typography) {
    if (themeOverrides.typography.headingFont) vars["--font-heading"] = themeOverrides.typography.headingFont;
    if (themeOverrides.typography.bodyFont) vars["--font-body"] = themeOverrides.typography.bodyFont;
    if (themeOverrides.typography.baseSize) vars["--font-size-base"] = `${themeOverrides.typography.baseSize}px`;
  }
  if (themeOverrides.radii) {
    for (const [key, val] of Object.entries(themeOverrides.radii)) {
      if (val) vars[`--radius-${key}`] = val;
    }
  }

  return vars;
}

export function tokensToCssString(tokens: ThemeTokens): string {
  const vars = tokensToCssVars(tokens);
  return Object.entries(vars)
    .map(([key, value]) => `${key}: ${value};`)
    .join("\n");
}
