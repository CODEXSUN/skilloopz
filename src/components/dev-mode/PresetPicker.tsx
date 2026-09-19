"use client";

import { useState } from "react";
import { getPresets, getUserPresets, deleteUserPreset, type Preset } from "@/lib/block-presets";

interface PresetPickerProps {
  blockType: string;
  onApply: (preset: Preset) => void;
}

export function PresetPicker({ blockType, onApply }: PresetPickerProps) {
  const [open, setOpen] = useState(false);
  const allPresets = getPresets(blockType);
  const userPresets = getUserPresets().filter((p) => p.type === blockType);
  const builtInCount = allPresets.length - userPresets.length;
  const hasBuiltIn = builtInCount > 0;
  const hasUser = userPresets.length > 0;

  if (allPresets.length === 0) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-lg bg-[rgba(255,255,255,0.04)] px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Presets
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-1 w-64 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(11,13,16,0.98)] p-2 shadow-xl backdrop-blur-xl">
            {hasBuiltIn && (
              <>
                <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Built-in
                </p>
                <div className="space-y-1">
                  {allPresets.slice(0, builtInCount).map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => {
                        onApply(preset);
                        setOpen(false);
                      }}
                      className="w-full rounded-lg px-2 py-2 text-left transition-colors hover:bg-glass"
                    >
                      <p className="text-xs font-medium text-foreground">{preset.name}</p>
                      <p className="text-[10px] text-muted-foreground">{preset.description}</p>
                    </button>
                  ))}
                </div>
              </>
            )}
            {hasUser && (
              <>
                {hasBuiltIn && <div className="my-1 mx-2 border-t border-white/5" />}
                <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Saved
                </p>
                <div className="space-y-1">
                  {userPresets.map((preset) => (
                    <div key={preset.id} className="group flex items-center gap-1 rounded-lg px-2 py-2 transition-colors hover:bg-glass">
                      <button
                        onClick={() => {
                          onApply(preset);
                          setOpen(false);
                        }}
                        className="flex-1 text-left"
                      >
                        <p className="text-xs font-medium text-foreground">{preset.name}</p>
                        <p className="text-[10px] text-muted-foreground">{preset.description}</p>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteUserPreset(preset.id);
                          setOpen(false);
                          // Force re-render by toggling
                          setTimeout(() => setOpen(true), 0);
                        }}
                        className="rounded p-1 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all"
                        title="Delete preset"
                      >
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
