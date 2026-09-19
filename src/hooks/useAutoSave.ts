"use client";

import { useEffect, useRef } from "react";
import { usePageBuilderStore } from "@/stores/pageBuilderStore";

const DEBOUNCE_MS = 5000;

export function useAutoSave(pageId: string, slug: string) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevRef = useRef("");

  useEffect(() => {
    const unsub = usePageBuilderStore.subscribe((state) => {
      const serialized = JSON.stringify(state.sections);
      if (serialized === prevRef.current) return;
      prevRef.current = serialized;

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(async () => {
        try {
          for (const section of state.sections) {
            const isNew = !section.id.includes("-");
            if (isNew) {
              await fetch(`/api/admin/pages/${slug}/sections`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  blockType: section.blockType,
                  sortOrder: section.sortOrder,
                  content: JSON.stringify(section.content),
                  settings: JSON.stringify(section.settings),
                }),
              });
            } else {
              await fetch(`/api/admin/pages/${slug}/sections/${section.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  sortOrder: section.sortOrder,
                  content: JSON.stringify(section.content),
                  settings: JSON.stringify(section.settings),
                }),
              });
            }
          }
        } catch {
        }
      }, DEBOUNCE_MS);
    });

    return () => {
      unsub();
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [pageId, slug]);
}
