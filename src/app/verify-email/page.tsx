"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { CheckCircle, XCircle, Mail, Loader2 } from "lucide-react";

const easing = [0.16, 1, 0.3, 1] as const;

function VerifyContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setMessage("No verification token provided.");
      return;
    }

    fetch(`/api/auth/verify-email?token=${token}`)
      .then((res) => {
        if (res.redirected) {
          const url = new URL(res.url);
          const error = url.searchParams.get("error");
          if (error === "already_verified") {
            setStatus("success");
            setMessage("Your email is already verified!");
          } else if (error === "expired_token") {
            setStatus("error");
            setMessage("Verification link expired. Please request a new one.");
          } else if (error === "invalid_token") {
            setStatus("error");
            setMessage("Invalid verification token.");
          } else {
            setStatus("error");
            setMessage("Verification failed. Please try again.");
          }
        } else {
          setStatus("success");
          setMessage("Email verified successfully! You can now log in.");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Verification failed. Please try again.");
      });
  }, [searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: easing }}
        className="w-full max-w-md"
      >
        <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-8 shadow-xl">
          <div className="flex flex-col items-center text-center">
            {status === "loading" && (
              <>
                <Loader2 className="h-12 w-12 animate-spin text-primary-400" />
                <h1 className="mt-4 font-heading text-xl font-bold text-foreground">Verifying your email...</h1>
              </>
            )}
            {status === "success" && (
              <>
                <CheckCircle className="h-12 w-12 text-emerald-400" />
                <h1 className="mt-4 font-heading text-xl font-bold text-foreground">Email Verified!</h1>
                <p className="mt-2 text-sm text-muted-foreground">{message}</p>
                <Link
                  href="/login"
                  className="mt-6 inline-flex h-10 items-center gap-2 rounded-xl bg-primary-500 px-6 text-sm font-semibold text-white transition-colors hover:bg-primary-600"
                >
                  Go to Login
                </Link>
              </>
            )}
            {status === "error" && (
              <>
                <XCircle className="h-12 w-12 text-red-400" />
                <h1 className="mt-4 font-heading text-xl font-bold text-foreground">Verification Failed</h1>
                <p className="mt-2 text-sm text-muted-foreground">{message}</p>
                <Link
                  href="/login"
                  className="mt-6 inline-flex h-10 items-center gap-2 rounded-xl bg-primary-500 px-6 text-sm font-semibold text-white transition-colors hover:bg-primary-600"
                >
                  Go to Login
                </Link>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary-400" />
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}
