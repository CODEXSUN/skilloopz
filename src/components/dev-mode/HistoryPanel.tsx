"use client";

import { useState } from "react";
import { Undo2, Redo2, History, Camera, Trash2, Clock, GitCompare } from "lucide-react";
import { useHistoryStore } from "@/stores/historyStore";
import { useDevModeStore } from "@/stores/devModeStore";
import { usePageBuilderStore } from "@/stores/pageBuilderStore";
import { setUndoing } from "@/stores/history-middleware";

export function HistoryPanel() {
  const [open, setOpen] = useState(false);
  const [compareTarget, setCompareTarget] = useState<string | null>(null);
  const enabled = useDevModeStore((s) => s.enabled);

  const undo = useHistoryStore((s) => s.undo);
  const redo = useHistoryStore((s) => s.redo);
  const snapshots = useHistoryStore((s) => s.snapshots);
  const saveSnapshot = useHistoryStore((s) => s.saveSnapshot);
  const restoreSnapshot = useHistoryStore((s) => s.restoreSnapshot);
  const deleteSnapshot = useHistoryStore((s) => s.deleteSnapshot);
  const canUndo = useHistoryStore((s) => s.canUndo);
  const canRedo = useHistoryStore((s) => s.canRedo);

  if (!enabled) return null;

  function handleSaveSnapshot() {
    const label = prompt("Name this snapshot:");
    if (label) {
      const sections = usePageBuilderStore.getState().sections;
      saveSnapshot(label, JSON.stringify(sections));
    }
  }

  const currentSections = usePageBuilderStore((s) => s.sections);

  function computeDiff(snapshotData: string): { added: number; removed: number; changed: number } {
    try {
      const snapSections = JSON.parse(snapshotData) as { id: string; blockType: string }[];
      const curIds = new Set(currentSections.map((s) => s.id));
      const snapIds = new Set(snapSections.map((s) => s.id));
      const added = currentSections.filter((s) => !snapIds.has(s.id)).length;
      const removed = snapSections.filter((s) => !curIds.has(s.id)).length;
      const changed = currentSections.filter((s) => snapIds.has(s.id)).length;
      return { added, removed, changed };
    } catch {
      return { added: 0, removed: 0, changed: 0 };
    }
  }

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => {
          setUndoing(true);
          const snapshot = undo();
          if (snapshot) {
            const sections = JSON.parse(snapshot.data);
            usePageBuilderStore.getState().setSections(sections);
          }
          setUndoing(false);
        }}
        disabled={!canUndo()}
        className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-glass hover:text-foreground disabled:opacity-30 disabled:pointer-events-none"
        title="Undo (Ctrl+Z)"
      >
        <Undo2 className="h-3.5 w-3.5" />
      </button>

      <button
        onClick={() => {
          setUndoing(true);
          const snapshot = redo();
          if (snapshot) {
            const sections = JSON.parse(snapshot.data);
            usePageBuilderStore.getState().setSections(sections);
          }
          setUndoing(false);
        }}
        disabled={!canRedo()}
        className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-glass hover:text-foreground disabled:opacity-30 disabled:pointer-events-none"
        title="Redo (Ctrl+Shift+Z)"
      >
        <Redo2 className="h-3.5 w-3.5" />
      </button>

      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-glass hover:text-foreground"
          title="History"
        >
          <History className="h-3.5 w-3.5" />
        </button>

        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <div className="absolute right-0 top-full z-50 mt-1 w-72 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(11,13,16,0.98)] p-3 shadow-xl backdrop-blur-xl">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-foreground">Version History</p>
                <button
                  onClick={handleSaveSnapshot}
                  className="flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] text-primary-400 hover:bg-primary-500/10 transition-colors"
                >
                  <Camera className="h-3 w-3" />
                  Snapshot
                </button>
              </div>

              {snapshots.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-6 text-center">
                  <Clock className="h-6 w-6 text-muted-foreground/30" />
                  <p className="text-xs text-muted-foreground">No snapshots yet</p>
                  <button
                    onClick={handleSaveSnapshot}
                    className="text-[10px] text-primary-400 hover:text-primary-300"
                  >
                    Save your first snapshot
                  </button>
                </div>
              ) : (
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {snapshots.map((snapshot) => {
                    const diff = computeDiff(snapshot.data);
                    return (
                      <div
                        key={snapshot.id}
                        className="group flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-glass"
                      >
                        <button
                          onClick={() => {
                            if (confirm("Restore this version?")) {
                              const restored = restoreSnapshot(snapshot.id);
                              if (restored) {
                                const sections = JSON.parse(restored.data);
                                usePageBuilderStore.getState().setSections(sections);
                              }
                            }
                          }}
                          className="flex-1 text-left min-w-0"
                        >
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-medium text-foreground truncate">{snapshot.label}</p>
                            {(diff.added > 0 || diff.removed > 0) && (
                              <span className="shrink-0 text-[9px] text-muted-foreground">
                                {diff.added > 0 && <span className="text-emerald-400">+{diff.added}</span>}
                                {diff.removed > 0 && <span className="text-red-400 ml-0.5">-{diff.removed}</span>}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-muted-foreground">
                            {new Date(snapshot.timestamp).toLocaleString()}
                          </p>
                        </button>
                        <div className="flex items-center gap-0.5">
                          <button
                            onClick={() => setCompareTarget(compareTarget === snapshot.id ? null : snapshot.id)}
                            className="rounded p-1 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-sky-400 transition-all"
                            title="Compare"
                          >
                            <GitCompare className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm("Delete this snapshot?")) {
                                deleteSnapshot(snapshot.id);
                              }
                            }}
                            className="rounded p-1 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                        {compareTarget === snapshot.id && (
                          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setCompareTarget(null)}>
                            <div className="max-h-[60vh] w-full max-w-lg overflow-auto rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(11,13,16,0.98)] p-4 shadow-xl backdrop-blur-xl mx-4" onClick={(e) => e.stopPropagation()}>
                              <p className="text-xs font-semibold text-foreground mb-3">Version Diff</p>
                              {(() => {
                                try {
                                  const snap = JSON.parse(snapshot.data) as { id: string; blockType: string }[];
                                  const cur = currentSections;
                                  const snapMap = new Map(snap.map((s) => [s.id, s]));
                                  const curMap = new Map(cur.map((s) => [s.id, s]));
                                  const allIds = new Set([...snap.map((s) => s.id), ...cur.map((s) => s.id)]);
                                  return (
                                    <div className="space-y-1">
                                      {[...allIds].map((id) => {
                                        const inSnap = snapMap.has(id);
                                        const inCur = curMap.has(id);
                                        const snapType = snapMap.get(id)?.blockType;
                                        const curType = curMap.get(id)?.blockType;
                                        let status: "added" | "removed" | "changed" | "unchanged" = "unchanged";
                                        if (!inSnap && inCur) status = "added";
                                        else if (inSnap && !inCur) status = "removed";
                                        else if (snapType !== curType) status = "changed";
                                        return (
                                          <div key={id} className={`rounded-lg px-2.5 py-1.5 text-[11px] font-mono flex items-center gap-2 ${
                                            status === "added" ? "bg-emerald-500/10 text-emerald-400" :
                                            status === "removed" ? "bg-red-500/10 text-red-400" :
                                            status === "changed" ? "bg-amber-500/10 text-amber-400" :
                                            "text-muted-foreground/50"
                                          }`}>
                                            <span className="w-6 shrink-0 text-[10px] font-bold">
                                              {status === "added" ? "+" : status === "removed" ? "−" : status === "changed" ? "~" : ""}
                                            </span>
                                            <span className="truncate">{curType ?? snapType}</span>
                                            <span className="text-[9px] text-muted-foreground/50 truncate">{id.slice(0, 8)}</span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  );
                                } catch {
                                  return <p className="text-[10px] text-muted-foreground">Could not parse diff</p>;
                                }
                              })()}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
