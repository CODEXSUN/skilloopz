"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Mail, Lock, ArrowRight, User } from "lucide-react";
import Link from "next/link";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";

const signupSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  ageGroup: z.enum(["under13", "13to18", "18plus"], {
    message: "Select your age group",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type SignupData = z.infer<typeof signupSchema>;

export function SignupForm() {
  const { signup } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [verificationUrl, setVerificationUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupData>({
    resolver: zodResolver(signupSchema),
  });

  async function onSubmit(data: SignupData) {
    setServerError(null);
    const { error, verificationToken } = await signup(data.email, data.password, undefined, data.ageGroup);
    if (error) {
      setServerError(error.message);
    } else {
      setSuccess(true);
      if (verificationToken) {
        setVerificationUrl(`${window.location.origin}/api/auth/verify-email?token=${verificationToken}`);
      }
    }
  }

  if (success) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20">
            <Mail className="h-6 w-6 text-emerald-400" />
          </div>
          <h3 className="text-lg font-bold text-foreground">Verify your email</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Click the link below to verify your email address.
          </p>
        </div>
        {verificationUrl && (
          <a
            href={verificationUrl}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-primary-500/20 bg-primary-500/10 py-3 text-sm font-medium text-primary-400 transition-colors hover:bg-primary-500/20"
          >
            Verify Email Address
            <ArrowRight className="h-4 w-4" />
          </a>
        )}
        <Link
          href="/login"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-foreground py-3 text-sm font-semibold text-background transition-colors hover:opacity-90"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {serverError && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {serverError}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email" required>
          Email
        </Label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            error={errors.email?.message}
            className="pl-11"
            {...register("email")}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" required>
          Password
        </Label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="password"
            type="password"
            placeholder="··········"
            autoComplete="new-password"
            error={errors.password?.message}
            className="pl-11"
            {...register("password")}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword" required>
          Confirm Password
        </Label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="confirmPassword"
            type="password"
            placeholder="··········"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            className="pl-11"
            {...register("confirmPassword")}
          />
        </div>
      </div>

      <div className="space-y-3">
        <Label required>Age Group</Label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: "under13", label: "Under 13", icon: <User className="h-4 w-4" /> },
            { value: "13to18", label: "13–18", icon: <User className="h-4 w-4" /> },
            { value: "18plus", label: "18+", icon: <User className="h-4 w-4" /> },
          ].map((option) => (
            <label
              key={option.value}
              className="group flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] px-4 py-4 text-sm text-muted-foreground transition-all has-[:checked]:border-primary-500/30 has-[:checked]:bg-primary-500/10 has-[:checked]:text-primary-400 hover:border-[rgba(255,255,255,0.15)]"
            >
              <input
                type="radio"
                value={option.value}
                className="sr-only"
                {...register("ageGroup")}
              />
              {option.icon}
              <span className="font-medium">{option.label}</span>
            </label>
          ))}
        </div>
        {errors.ageGroup && (
          <p className="text-sm text-red-400">{errors.ageGroup.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="group relative flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-foreground text-sm font-semibold text-background transition-all hover:shadow-glow-sm active:scale-[0.98] disabled:opacity-50"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Creating account...
          </>
        ) : (
          <>
            Create account
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </>
        )}
      </button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-primary-400 transition-colors hover:text-primary-300"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
