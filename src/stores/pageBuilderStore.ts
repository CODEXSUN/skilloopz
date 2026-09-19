import { create } from "zustand";

export type SectionType =
  | "hero"
  | "feature-grid"
  | "course-carousel"
  | "stats-bar"
  | "testimonials"
  | "cta-banner"
  | "faq"
  | "pricing-table"
  | "custom-html";

export interface ResponsiveStyles {
  desktop?: Record<string, unknown>;
  tablet?: Record<string, unknown>;
  mobile?: Record<string, unknown>;
}

export interface SectionSettings {
  styles?: Record<string, unknown>;
  responsiveStyles?: ResponsiveStyles;
  hidden?: boolean;
  locked?: boolean;
  [key: string]: unknown;
}

export interface PageSection {
  id: string;
  pageId: string;
  blockType: SectionType;
  sortOrder: number;
  content: Record<string, unknown>;
  settings: SectionSettings;
}

interface PageBuilderState {
  sections: PageSection[];
  selectedId: string | null;
  isLoading: boolean;
  isDirty: boolean;

  setSections: (sections: PageSection[]) => void;
  addSection: (section: PageSection) => void;
  updateSection: (id: string, data: Partial<PageSection>) => void;
  removeSection: (id: string) => void;
  reorderSections: (sections: PageSection[]) => void;
  selectSection: (id: string | null) => void;
  setLoading: (loading: boolean) => void;
  markClean: () => void;
}

export const usePageBuilderStore = create<PageBuilderState>((set) => ({
  sections: [],
  selectedId: null,
  isLoading: false,
  isDirty: false,

  setSections: (sections) => set({ sections, isDirty: false }),

  addSection: (section) =>
    set((state) => ({
      sections: [...state.sections, section],
      isDirty: true,
    })),

  updateSection: (id, data) =>
    set((state) => ({
      sections: state.sections.map((s) =>
        s.id === id ? { ...s, ...data } : s,
      ),
      isDirty: true,
    })),

  removeSection: (id) =>
    set((state) => ({
      sections: state.sections.filter((s) => s.id !== id),
      selectedId: state.selectedId === id ? null : state.selectedId,
      isDirty: true,
    })),

  reorderSections: (sections) => set({ sections, isDirty: true }),

  selectSection: (id) => set({ selectedId: id }),

  setLoading: (isLoading) => set({ isLoading }),

  markClean: () => set({ isDirty: false }),
}));
