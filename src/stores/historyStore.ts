import { create } from "zustand";
import { usePageBuilderStore } from "./pageBuilderStore";

export interface Snapshot {
  id: string;
  timestamp: number;
  label: string;
  data: string;
}

const MAX_HISTORY = 50;

interface HistoryState {
  past: Snapshot[];
  future: Snapshot[];
  snapshots: Snapshot[];
  isUndoing: boolean;

  pushSnapshot: (snapshot: Snapshot) => void;
  undo: () => Snapshot | null;
  redo: () => Snapshot | null;
  setUndoing: (value: boolean) => void;
  saveSnapshot: (label: string, data: string) => void;
  restoreSnapshot: (id: string) => Snapshot | undefined;
  deleteSnapshot: (id: string) => void;
  clear: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
}

function captureCurrentSnapshot(): Snapshot {
  const sections = usePageBuilderStore.getState().sections;
  return {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    label: "State",
    data: JSON.stringify(sections),
  };
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  past: [],
  future: [],
  snapshots: [],
  isUndoing: false,

  pushSnapshot: (snapshot) =>
    set((state) => ({
      past: [...state.past.slice(-MAX_HISTORY + 1), snapshot],
      future: [],
    })),

  undo: () => {
    const state = get();
    if (state.past.length === 0) return null;

    const previous = state.past[state.past.length - 1];
    const currentSnapshot = captureCurrentSnapshot();

    set((s) => ({
      past: s.past.slice(0, -1),
      future: [currentSnapshot, ...s.future],
    }));

    return previous;
  },

  redo: () => {
    const state = get();
    if (state.future.length === 0) return null;

    const next = state.future[0];
    const currentSnapshot = captureCurrentSnapshot();

    set((s) => ({
      past: [...s.past, currentSnapshot],
      future: s.future.slice(1),
    }));

    return next;
  },

  saveSnapshot: (label, data) =>
    set((state) => ({
      snapshots: [
        ...state.snapshots,
        {
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          label,
          data,
        },
      ],
    })),

  restoreSnapshot: (id) => {
    const state = get();
    const snapshot = state.snapshots.find((s) => s.id === id);
    if (!snapshot) return undefined;

    set((s) => ({
      past: [...s.past, captureCurrentSnapshot()],
      future: [],
    }));

    return snapshot;
  },

  deleteSnapshot: (id) =>
    set((state) => ({
      snapshots: state.snapshots.filter((s) => s.id !== id),
    })),

  clear: () => set({ past: [], future: [] }),

  setUndoing: (value) => set({ isUndoing: value }),

  canUndo: () => get().past.length > 0,

  canRedo: () => get().future.length > 0,
}));
