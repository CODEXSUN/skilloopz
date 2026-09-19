"use client";

import { useState, useEffect } from "react";

export function useFeatureFlag(key: string): boolean {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    fetch("/api/admin/feature-flags")
      .then((res) => res.json())
      .then((flags: { key: string; enabled: boolean }[]) => {
        const flag = flags.find((f) => f.key === key);
        setEnabled(flag?.enabled ?? false);
      })
      .catch(() => {});
  }, [key]);

  return enabled;
}
