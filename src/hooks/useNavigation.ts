"use client";

import { useState, useEffect } from "react";
import type { NavItemData } from "@/lib/navigation-service";

interface UseNavigationResult {
  items: NavItemData[];
  isLoading: boolean;
  error: string | null;
}

export function useNavigation(role: string): UseNavigationResult {
  const [items, setItems] = useState<NavItemData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetch(`/api/admin/navigation?role=${encodeURIComponent(role)}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch navigation");
        return res.json();
      })
      .then((data) => {
        if (!cancelled) {
          setItems(data);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message);
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [role]);

  return { items, isLoading, error };
}
