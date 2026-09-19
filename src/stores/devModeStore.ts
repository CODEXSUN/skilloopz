import { create } from "zustand";

export type DeviceMode = "desktop" | "tablet" | "mobile";

export interface BlockOverlay {
  id: string;
  type: string;
  label: string;
  path: string;
  rect: DOMRect | null;
}

interface DevModeState {
  enabled: boolean;
  hoveredId: string | null;
  selectedId: string | null;
  deviceMode: DeviceMode;
  showGuides: boolean;
  showLabels: boolean;
  overlays: Map<string, BlockOverlay>;

  toggle: () => void;
  enable: () => void;
  disable: () => void;
  setHovered: (id: string | null) => void;
  select: (id: string | null) => void;
  setDeviceMode: (mode: DeviceMode) => void;
  toggleGuides: () => void;
  toggleLabels: () => void;
  updateOverlay: (id: string, data: Partial<BlockOverlay>) => void;
  removeOverlay: (id: string) => void;
  clearOverlays: () => void;
}

export const useDevModeStore = create<DevModeState>((set) => ({
  enabled: false,
  hoveredId: null,
  selectedId: null,
  deviceMode: "desktop",
  showGuides: true,
  showLabels: true,
  overlays: new Map(),

  toggle: () =>
    set((state) => {
      const next = !state.enabled;
      return {
        enabled: next,
        selectedId: next ? state.selectedId : null,
        hoveredId: null,
      };
    }),

  enable: () => set({ enabled: true }),

  disable: () =>
    set({
      enabled: false,
      selectedId: null,
      hoveredId: null,
    }),

  setHovered: (id) => set({ hoveredId: id }),

  select: (id) => set({ selectedId: id }),

  setDeviceMode: (mode) => set({ deviceMode: mode }),

  toggleGuides: () => set((state) => ({ showGuides: !state.showGuides })),

  toggleLabels: () => set((state) => ({ showLabels: !state.showLabels })),

  updateOverlay: (id, data) =>
    set((state) => {
      const next = new Map(state.overlays);
      const existing = next.get(id);
      if (existing) {
        next.set(id, { ...existing, ...data });
      } else {
        next.set(id, {
          id,
          type: data.type ?? "unknown",
          label: data.label ?? "",
          path: data.path ?? "",
          rect: data.rect ?? null,
        });
      }
      return { overlays: next };
    }),

  removeOverlay: (id) =>
    set((state) => {
      const next = new Map(state.overlays);
      next.delete(id);
      return { overlays: next };
    }),

  clearOverlays: () => set({ overlays: new Map() }),
}));
