"use client";

import { type ReactNode, useEffect } from "react";

import { QueryProvider } from "@/lib/providers";
import { ThemeProvider } from "@/lib/theme/theme-provider";
import { GlobalErrorCatcher } from "@/components/error-tracking/global-error-catcher";
import { LearningStyleProvider } from "@/lib/learning/learning-style-provider";

export function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    import("@/lib/registrations");
  }, []);

  return (
    <QueryProvider>
      <ThemeProvider>
        <LearningStyleProvider>
          <GlobalErrorCatcher />
          {children}
        </LearningStyleProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}
