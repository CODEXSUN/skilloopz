"use client";

import { useQuery } from "@tanstack/react-query";
import { parseTokens, tokensToCssVars, type ThemeTokens } from "@/lib/theme/theme-converter";

interface SiteThemeRecord {
  id: string;
  name: string;
  isActive: boolean;
  tokens: string;
}

export function useTheme() {
  const { data, isLoading, error } = useQuery<SiteThemeRecord>({
    queryKey: ["activeTheme"],
    queryFn: async () => {
      const res = await fetch("/api/admin/themes/active");
      if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error("Failed to load theme");
      }
      return res.json();
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  const themeTokens: ThemeTokens = data ? parseTokens(data.tokens) : parseTokens("{}");
  const cssVars = tokensToCssVars(themeTokens);

  return {
    theme: data,
    tokens: themeTokens,
    cssVars,
    isLoading,
    error,
    themeName: data?.name ?? "Default",
  };
}
