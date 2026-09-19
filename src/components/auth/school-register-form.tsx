"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Mail, Lock, ArrowRight, Building2, Phone, Globe, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schoolRegisterSchema = z.object({
  schoolName: z.string().min(2, "School name must be at least 2 characters"),
  schoolCode: z.string().min(3, "School code must be at least 3 characters").regex(/^[a-zA-Z0-9-]+$/, "Only letters, numbers, and hyphens"),
  adminName: z.string().min(2, "Name must be at least 2 characters"),
  adminEmail: z.string().email("Enter a valid email address"),
  adminPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  phone: z.string().optional(),
  website: z.string().url("Enter a valid URL").or(z.literal("")).optional(),
  city: z.string().optional(),
  country: z.string().optional(),
}).refine((data) => data.adminPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type SchoolRegisterData = z.infer<typeof schoolRegisterSchema>;

export function SchoolRegisterForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState(1);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<SchoolRegisterData>({
    resolver: zodResolver(schoolRegisterSchema),
    defaultValues: {
      country: "US",
    },
  });

  async function onSubmit(data: SchoolRegisterData) {
    setServerError(null);

    try {
      const res = await fetch("/api/register/school", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.schoolName.trim(),
          code: data.schoolCode.trim().toLowerCase(),
          adminName: data.adminName.trim(),
          adminEmail: data.adminEmail.trim(),
          adminPassword: data.adminPassword,
          phone: data.phone?.trim() || null,
          website: data.website?.trim() || null,
          city: data.city?.trim() || null,
          country: data.country?.trim() || "US",
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        setServerError(err.error ?? "Failed to register school");
        return;
      }

      setSuccess(true);
    } catch {
      setServerError("Failed to register school. Please try again.");
    }
  }

  if (success) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20">
            <CheckCircle2 className="h-6 w-6 text-emerald-400" />
          </div>
          <h3 className="text-lg font-bold text-foreground">School registered!</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Your school has been registered. You can now sign in as the school admin.
          </p>
        </div>
        <Link
          href="/login"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-foreground py-3 text-sm font-semibold text-background transition-colors hover:opacity-90"
        >
          Sign in to your school portal
          <ArrowRight className="h-4 w-4" />
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

      {step === 1 && (
        <>
          <div className="space-y-2">
            <Label htmlFor="schoolName" required>
              School Name
            </Label>
            <div className="relative">
              <Building2 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="schoolName"
                placeholder="Springfield High School"
                className="pl-11"
                error={errors.schoolName?.message}
                {...register("schoolName")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="schoolCode" required>
              School Code
            </Label>
            <Input
              id="schoolCode"
              placeholder="springfield-high"
              error={errors.schoolCode?.message}
              {...register("schoolCode")}
            />
            <p className="text-xs text-muted-foreground">
              A unique identifier for your school. Letters, numbers, and hyphens only.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                placeholder="Springfield"
                {...register("city")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                placeholder="US"
                {...register("country")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <div className="relative">
              <Globe className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="website"
                type="url"
                placeholder="https://springfield.edu"
                className="pl-11"
                error={errors.website?.message}
                {...register("website")}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => setStep(2)}
            className="group relative flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-foreground text-sm font-semibold text-background transition-all hover:shadow-glow-sm active:scale-[0.98]"
          >
            Continue
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </>
      )}

      {step === 2 && (
        <>
          <div className="space-y-2">
            <Label htmlFor="adminName" required>
              Admin Name
            </Label>
            <div className="relative">
              <Building2 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="adminName"
                placeholder="John Smith"
                className="pl-11"
                error={errors.adminName?.message}
                {...register("adminName")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="adminEmail" required>
              Admin Email
            </Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="adminEmail"
                type="email"
                placeholder="admin@springfield.edu"
                className="pl-11"
                error={errors.adminEmail?.message}
                {...register("adminEmail")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <div className="relative">
              <Phone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                placeholder="+1 555-123-4567"
                className="pl-11"
                {...register("phone")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="adminPassword" required>
              Password
            </Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="adminPassword"
                type="password"
                placeholder="··········"
                className="pl-11"
                error={errors.adminPassword?.message}
                {...register("adminPassword")}
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
                className="pl-11"
                error={errors.confirmPassword?.message}
                {...register("confirmPassword")}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-border bg-background text-sm font-semibold text-foreground transition-all hover:bg-muted"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-foreground text-sm font-semibold text-background transition-all hover:shadow-glow-sm active:scale-[0.98] disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Registering...
                </>
              ) : (
                <>
                  Register School
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </div>
        </>
      )}

      <p className="text-center text-sm text-muted-foreground">
        Already have a school account?{" "}
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
