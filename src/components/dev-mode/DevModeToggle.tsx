"use client";

import { Code2, Eye } from "lucide-react";
import { useDevModeStore } from "@/stores/devModeStore";

export function DevModeToggle() {
  const enabled = useDevModeStore((s) => s.enabled);
  const toggle = useDevModeStore((s) => s.toggle);

  return (
    <button
      onClick={toggle}
      className={`group relative inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-300 ${
        enabled
          ? "bg-primary-500 text-white shadow-glow-sm"
          : "glass glass-hover text-muted-foreground hover:text-foreground"
      }`}
    >
      {enabled ? (
        <>
          <Code2 className="h-4 w-4" />
          <span>Dev Mode</span>
          <span className="ml-1 flex h-2 w-2">
            <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-white opacity-75" />
            <span className="inline-flex h-2 w-2 rounded-full bg-white" />
          </span>
        </>
      ) : (
        <>
          <Eye className="h-4 w-4" />
          <span>Viewer Mode</span>
        </>
      )}
    </button>
  );
}
