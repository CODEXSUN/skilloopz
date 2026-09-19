"use client";

import { useEffect } from "react";
import { useTheme } from "@/lib/theme/useTheme";
import { ThemeModeProvider } from "@/lib/theme/useThemeMode";

interface ThemeProviderProps {
  children: React.ReactNode;
}

function ThemeVarsProvider({ children }: { children: React.ReactNode }) {
  const { cssVars, isLoading } = useTheme();

  useEffect(() => {
    if (isLoading) return;
    const root = document.documentElement;
    for (const [key, value] of Object.entries(cssVars)) {
      root.style.setProperty(key, value);
    }

    return () => {
      for (const key of Object.keys(cssVars)) {
        root.style.removeProperty(key);
      }
    };
  }, [cssVars, isLoading]);

  return <>{children}</>;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <ThemeModeProvider>
      <ThemeVarsProvider>
        {children}
      </ThemeVarsProvider>
    </ThemeModeProvider>
  );
}
