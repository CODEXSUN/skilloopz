"use client";

import { createContext, useContext, useCallback, useEffect, useState, type ReactNode } from "react";

interface LearningStyle {
  id: string;
  name: string;
  label: string;
  description: string | null;
  icon: string | null;
}

interface LearningProfile {
  id: string;
  userId: string;
  learningStyle: LearningStyle | null;
  preferredDifficulty: number;
  interests: string;
  attentionSpan: number;
  memoryScore: number;
  quizCompleted: boolean;
  styleOverridden: boolean;
}

interface LearningContextValue {
  profile: LearningProfile | null;
  loading: boolean;
  error: string | null;
  detectStyle: () => Promise<void>;
  updateProfile: (data: Partial<LearningProfile>) => Promise<void>;
  refresh: () => Promise<void>;
}

const LearningContext = createContext<LearningContextValue | null>(null);

export function LearningStyleProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<LearningProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/student/learning-profile");
      if (!res.ok) {
        if (res.status === 401) { setProfile(null); return; }
        throw new Error("Failed to fetch learning profile");
      }
      const data = await res.json();
      setProfile(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const detectStyle = useCallback(async () => {
    try {
      const res = await fetch("/api/student/detect-style", { method: "POST" });
      if (!res.ok) throw new Error("Failed to detect learning style");
      await fetchProfile();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Detection failed");
    }
  }, [fetchProfile]);

  const updateProfile = useCallback(async (data: Partial<LearningProfile>) => {
    try {
      const res = await fetch("/api/student/learning-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update profile");
      await fetchProfile();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    }
  }, [fetchProfile]);

  return (
    <LearningContext.Provider value={{ profile, loading, error, detectStyle, updateProfile, refresh: fetchProfile }}>
      {children}
    </LearningContext.Provider>
  );
}

export function useLearningProfile() {
  const ctx = useContext(LearningContext);
  if (!ctx) throw new Error("useLearningProfile must be used within LearningStyleProvider");
  return ctx;
}