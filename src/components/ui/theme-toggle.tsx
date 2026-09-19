"use client";

import { Sun, Moon } from "lucide-react";
import { useThemeMode } from "@/lib/theme/useThemeMode";
import { Button } from "@/components/ui/button";

interface ThemeToggleProps {
  variant?: "icon" | "full";
}

export function ThemeToggle({ variant = "icon" }: ThemeToggleProps) {
  const { mode, toggle } = useThemeMode();

  if (variant === "full") {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={toggle}
        className="gap-2"
      >
        {mode === "dark" ? (
          <>
            <Sun className="h-4 w-4" />
            Light Mode
          </>
        ) : (
          <>
            <Moon className="h-4 w-4" />
            Dark Mode
          </>
        )}
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={toggle}
      aria-label={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      {mode === "dark" ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </Button>
  );
}
