import { create } from "zustand";

export type LocalUser = {
  id: string;
  email: string | null;
  fullName: string | null;
  role: string;
  ageGroup: string | null;
  avatarUrl: string | null;
  onboardingCompleted: boolean;
};

interface AuthState {
  user: LocalUser | null;
  isLoading: boolean;
  setUser: (user: LocalUser | null) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
  reset: () => set({ user: null, isLoading: false }),
}));
