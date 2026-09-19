"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Fingerprint, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

import { useWebAuthn } from "@/hooks/useWebAuthn";
import { Button } from "@/components/ui/button";

export default function PasskeyLoginPage() {
  const router = useRouter();
  const { isSupported, authenticate } = useWebAuthn();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin() {
    setIsLoading(true);
    setError(null);

    try {
      const credential = await authenticate();
      if (!credential) {
        setError("Authentication cancelled or failed. Please try again.");
        return;
      }

      const res = await fetch("/api/auth/passkey/authenticate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          credentialId: credential.id,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err.error ?? "Authentication failed");
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  if (!isSupported) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-full max-w-md space-y-6 text-center">
          <Fingerprint className="mx-auto h-16 w-16 text-muted-foreground/40" />
          <h1 className="text-2xl font-bold text-foreground">Biometric Login Unavailable</h1>
          <p className="text-muted-foreground">
            Your browser does not support passkeys. Please use email and password to sign in.
          </p>
          <Button asChild>
            <Link href="/login">
              <ArrowLeft className="h-4 w-4" />
              Back to Login
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary-500/10">
          <Fingerprint className="h-10 w-10 text-primary-400" />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-foreground">Sign in with Biometrics</h1>
          <p className="mt-2 text-muted-foreground">
            Use your fingerprint, face, or device PIN to sign in.
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <Button
          onClick={handleLogin}
          disabled={isLoading}
          size="lg"
          className="w-full gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Authenticating...
            </>
          ) : (
            <>
              <Fingerprint className="h-5 w-5" />
              Use Biometrics
            </>
          )}
        </Button>

        <Link
          href="/login"
          className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to email login
        </Link>
      </div>
    </div>
  );
}
