"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, type LocalUser } from "@/stores/authStore";

export function useAuth() {
  const router = useRouter();
  const { user, isLoading, setUser, setLoading, reset } = useAuthStore();
  const [isConfigured] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) throw new Error("Not authenticated");
        return res.json();
      })
      .then((data) => {
        setUser(data.user as LocalUser | null);
      })
      .catch(() => {
        setUser(null);
      });
  }, [setUser]);

  async function login(email: string, password: string) {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) return { error: new Error(data.error ?? "Login failed") };
      await fetchUser();
      router.push("/onboarding");
      return { error: null };
    } catch (e) {
      return { error: e instanceof Error ? e : new Error("Login failed") };
    } finally {
      setLoading(false);
    }
  }

  async function signup(email: string, password: string, role?: string, ageGroup?: string, fullName?: string) {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role, ageGroup, fullName }),
      });
      const data = await res.json();
      if (!res.ok) return { error: new Error(data.error ?? "Signup failed") };
      await fetchUser();
      return { error: null, verificationToken: data.verificationToken as string | undefined };
    } catch (e) {
      return { error: e instanceof Error ? e : new Error("Signup failed") };
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    reset();
    router.push("/login");
  }

  async function signInWithGoogle() {
    return { error: new Error("Google sign-in unavailable in local auth mode") };
  }

  async function resetPassword(email: string) {
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) return { error: new Error(data.error ?? "Failed to send reset link") };
      return { error: null };
    } catch (e) {
      return { error: e instanceof Error ? e : new Error("Failed to send reset link") };
    }
  }

  async function fetchUser() {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch {
      // ignore
    }
  }

  return {
    user,
    isLoading,
    login,
    signup,
    logout,
    signInWithGoogle,
    resetPassword,
    isConfigured,
  };
}
