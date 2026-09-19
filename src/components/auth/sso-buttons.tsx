"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type SsoProvider = {
  id: string;
  name: string;
  providerType: string;
  buttonLabel: string | null;
  iconUrl: string | null;
};

const PROVIDER_ICONS: Record<string, string> = {
  google: "G",
  microsoft: "M",
  github: "Gh",
};

export function SsoButtons() {
  const [providers, setProviders] = useState<SsoProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [signingIn, setSigningIn] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/sso")
      .then((r) => (r.ok ? r.json() : []))
      .then(setProviders)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleSignIn(providerId: string) {
    setSigningIn(providerId);
    window.location.href = `/api/auth/sso/${providerId}`;
  }

  if (loading || providers.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {providers.map((provider) => (
          <Button
            key={provider.id}
            type="button"
            variant="outline"
            disabled={signingIn !== null}
            onClick={() => handleSignIn(provider.id)}
            className="h-12"
          >
            {signingIn === provider.id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : provider.iconUrl ? (
              <img src={provider.iconUrl} alt="" className="h-5 w-5" />
            ) : (
              <span className="text-sm font-bold">{PROVIDER_ICONS[provider.providerType] || provider.name[0]}</span>
            )}
            <span className="sr-only">{provider.buttonLabel || provider.name}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
