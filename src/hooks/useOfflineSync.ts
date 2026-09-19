"use client";

import { useState, useEffect, useCallback } from "react";

import { offlineDB } from "@/lib/offline-db";

export function useOfflineSync() {
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    offlineDB.getUnsyncedItems().then((items) => {
      setPendingCount(items.length);
    });

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "SYNC_TRIGGERED") {
        syncQueue();
      }
    };

    navigator.serviceWorker?.addEventListener("message", handleMessage);

    return () => {
      navigator.serviceWorker?.removeEventListener("message", handleMessage);
    };
  }, []);

  const syncQueue = useCallback(async () => {
    if (isSyncing || !navigator.onLine) return;

    setIsSyncing(true);

    try {
      const items = await offlineDB.getUnsyncedItems();

      for (const item of items) {
        try {
          const endpoint = getSyncEndpoint(item);
          const res = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(item.payload),
          });

          if (res.ok) {
            await offlineDB.markSynced(item.id);
          }
        } catch {
          // Item will be retried on next sync
        }
      }

      await offlineDB.clearSyncedItems();
      const remaining = await offlineDB.getUnsyncedItems();
      setPendingCount(remaining.length);
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing]);

  useEffect(() => {
    const handleOnline = () => {
      syncQueue();
    };

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [syncQueue]);

  return { pendingCount, isSyncing, syncQueue };
}

function getSyncEndpoint(item: { type: string }): string {
  switch (item.type) {
    case "progress":
      return "/api/lessons/progress";
    case "quiz":
      return "/api/quizzes/attempt";
    case "note":
      return "/api/notes";
    case "bookmark":
      return "/api/bookmarks";
    default:
      return "/api/sync";
  }
}
