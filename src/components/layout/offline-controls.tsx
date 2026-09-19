"use client";

import { useEffect, useState } from "react";
import { RefreshCw, Wifi, WifiOff } from "lucide-react";

import { useOfflineSync } from "@/hooks/useOfflineSync";

export function OfflineControls() {
  const { pendingCount, isSyncing, syncQueue } = useOfflineSync();
  const [isOnline, setIsOnline] = useState(true);
  const [swRegistered, setSwRegistered] = useState(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").then(() => {
        setSwRegistered(true);
      }).catch(() => {
        setSwRegistered(false);
      });
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!swRegistered && pendingCount === 0) return null;

  return (
    <div className="flex items-center gap-2">
      {!isOnline && (
        <div className="flex items-center gap-1 text-xs text-amber-400">
          <WifiOff className="h-3 w-3" />
          <span>Offline</span>
        </div>
      )}

      {isOnline && pendingCount > 0 && (
        <button
          onClick={syncQueue}
          disabled={isSyncing}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-3 w-3 ${isSyncing ? "animate-spin" : ""}`} />
          <span>Sync {pendingCount} item{pendingCount !== 1 ? "s" : ""}</span>
        </button>
      )}

      {isOnline && pendingCount === 0 && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Wifi className="h-3 w-3" />
          <span>Online</span>
        </div>
      )}
    </div>
  );
}
