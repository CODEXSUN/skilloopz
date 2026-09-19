"use client";

import { useEffect, useCallback, useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { useDevModeStore } from "@/stores/devModeStore";
import { useHistoryStore } from "@/stores/historyStore";
import { usePageBuilderStore } from "@/stores/pageBuilderStore";
import { initHistoryMiddleware, setUndoing } from "@/stores/history-middleware";
import { DevModeShell } from "./DevModeShell";

interface DevModeProviderProps {
  children: ReactNode;
  pageId?: string;
  pageSlug?: string;
  pageStatus?: string;
}

export function DevModeProvider({ children, pageId, pageSlug, pageStatus }: DevModeProviderProps) {
  const searchParams = useSearchParams();
  const enabled = useDevModeStore((s) => s.enabled);
  const enable = useDevModeStore((s) => s.enable);
  const undo = useHistoryStore((s) => s.undo);
  const redo = useHistoryStore((s) => s.redo);
  const [toast, setToast] = useState<{ message: string; variant: "success" | "error" } | null>(null);

  useEffect(() => {
    if (searchParams.get("dev") === "true") {
      queueMicrotask(enable);
    }
  }, [searchParams, enable]);

  useEffect(() => {
    initHistoryMiddleware();
  }, []);

  const handleKeyDown = useCallback(
    async (e: KeyboardEvent) => {
      if (!enabled) return;

      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        setUndoing(true);
        const snapshot = undo();
        if (snapshot) {
          const sections = JSON.parse(snapshot.data);
          usePageBuilderStore.getState().setSections(sections);
        }
        setUndoing(false);
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "z" && e.shiftKey) {
        e.preventDefault();
        setUndoing(true);
        const snapshot = redo();
        if (snapshot) {
          const sections = JSON.parse(snapshot.data);
          usePageBuilderStore.getState().setSections(sections);
        }
        setUndoing(false);
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (!pageSlug) return;
        const sections = usePageBuilderStore.getState().sections;
        try {
          for (const section of sections) {
            const isNew = !section.id.includes("-");
            if (isNew) {
              await fetch(`/api/admin/pages/${pageSlug}/sections`, {
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
              await fetch(`/api/admin/pages/${pageSlug}/sections/${section.id}`, {
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
          setToast({ message: "Saved!", variant: "success" });
          setTimeout(() => setToast(null), 2000);
        } catch {
          setToast({ message: "Save failed", variant: "error" });
          setTimeout(() => setToast(null), 3000);
        }
      }

      if (e.key === "Escape") {
        const selectedId = useDevModeStore.getState().selectedId;
        useDevModeStore.getState().select(null);
        usePageBuilderStore.getState().selectSection(null);
      }

      if (e.key === "Delete" || e.key === "Backspace") {
        const selectedId = useDevModeStore.getState().selectedId;
        if (selectedId) {
          const section = usePageBuilderStore.getState().sections.find((s) => s.id === selectedId);
          if (section?.settings.locked) return;
          e.preventDefault();
          usePageBuilderStore.getState().removeSection(selectedId);
          useDevModeStore.getState().select(null);
          usePageBuilderStore.getState().selectSection(null);
        }
      }
    },
    [enabled, undo, redo, pageSlug],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <>
      {toast && (
        <div
          className={`fixed right-4 top-20 z-[200] rounded-lg border px-4 py-3 text-sm font-medium shadow-lg transition-all ${
            toast.variant === "success"
              ? "border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200"
              : "border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200"
          }`}
        >
          {toast.message}
        </div>
      )}
      {(enabled || searchParams?.get("dev") === "true") ? (
        <DevModeShell pageId={pageId} pageSlug={pageSlug} pageStatus={pageStatus}>{children}</DevModeShell>
      ) : (
        <>{children}</>
      )}
    </>
  );
}
