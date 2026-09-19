"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";

type ThemeMode = "light" | "dark";

interface ThemeModeContextValue {
  mode: ThemeMode;
  toggle: () => void;
  setMode: (mode: ThemeMode) => void;
}

const ThemeModeContext = createContext<ThemeModeContextValue>({
  mode: "dark",
  toggle: () => {},
  setMode: () => {},
});

export function ThemeModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("neot-theme-mode") as ThemeMode | null;
    queueMicrotask(() => {
      if (stored === "light" || stored === "dark") {
        setModeState(stored);
      }
      setMounted(true);
    });
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    if (mode === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("neot-theme-mode", mode);
  }, [mode, mounted]);

  const toggle = useCallback(() => {
    setModeState((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  const setMode = useCallback((newMode: ThemeMode) => {
    setModeState(newMode);
  }, []);

  return (
    <ThemeModeContext.Provider value={{ mode, toggle, setMode }}>
      {children}
    </ThemeModeContext.Provider>
  );
}

export function useThemeMode() {
  return useContext(ThemeModeContext);
}
