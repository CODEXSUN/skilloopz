"use client";

import { create } from "zustand";

interface BlockProgress {
  blockIndex: number;
  completed: boolean;
  score?: number;
}

interface LessonState {
  currentBlockIndex: number;
  totalBlocks: number;
  blockProgress: Record<number, BlockProgress>;
  isCompleted: boolean;
  setCurrentBlock: (index: number) => void;
  setTotalBlocks: (total: number) => void;
  markBlockComplete: (index: number, score?: number) => void;
  markCompleted: () => void;
  reset: () => void;
}

export const useLessonStore = create<LessonState>((set) => ({
  currentBlockIndex: 0,
  totalBlocks: 0,
  blockProgress: {},
  isCompleted: false,

  setCurrentBlock: (index) => set({ currentBlockIndex: index }),

  setTotalBlocks: (total) => set({ totalBlocks: total }),

  markBlockComplete: (index, score) =>
    set((state) => ({
      blockProgress: {
        ...state.blockProgress,
        [index]: { blockIndex: index, completed: true, score },
      },
    })),

  markCompleted: () => set({ isCompleted: true }),

  reset: () =>
    set({
      currentBlockIndex: 0,
      totalBlocks: 0,
      blockProgress: {},
      isCompleted: false,
    }),
}));
