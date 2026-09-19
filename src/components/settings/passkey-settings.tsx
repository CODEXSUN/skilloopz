"use client";

import { useState, useEffect, useCallback } from "react";
import { Fingerprint, Plus, Trash2, Loader2, Shield } from "lucide-react";

import { useWebAuthn } from "@/hooks/useWebAuthn";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PasskeyRecord {
  id: string;
  credentialId: string;
  deviceType: string;
  backedUp: boolean;
  transports: string;
  createdAt: string;
  lastUsedAt: string | null;
}

export function PasskeySettings() {
  const { isSupported, register } = useWebAuthn();
  const [passkeys, setPasskeys] = useState<PasskeyRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);

  const fetchPasskeys = useCallback(() => {
    fetch("/api/auth/passkey/list")
      .then((res) => res.ok ? res.json() : { passkeys: [] })
      .then((data) => setPasskeys(data.passkeys ?? []))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    fetchPasskeys();
  }, [fetchPasskeys]);

  async function handleRegister() {
    setIsRegistering(true);

    try {
      const credential = await register("", "");
      if (!credential) {
        alert("Failed to register passkey. Please try again.");
        return;
      }

      const res = await fetch("/api/auth/passkey/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error ?? "Failed to register passkey");
        return;
      }

      fetchPasskeys();
    } finally {
      setIsRegistering(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this passkey?")) return;

    try {
      const res = await fetch("/api/auth/passkey/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error ?? "Failed to remove passkey");
        return;
      }

      fetchPasskeys();
    } catch {
      alert("Failed to remove passkey");
    }
  }

  function formatTransports(transportsJson: string): string {
    try {
      const transports = JSON.parse(transportsJson) as string[];
      if (transports.length === 0) return "Unknown";
      return transports.map((t) => t.charAt(0).toUpperCase() + t.slice(1)).join(", ");
    } catch {
      return "Unknown";
    }
  }

  function formatDate(dateStr: string | null): string {
    if (!dateStr) return "Never";
    return new Date(dateStr).toLocaleDateString();
  }

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Fingerprint className="h-5 w-5 text-muted-foreground" />
            Biometric Login
          </CardTitle>
          <CardDescription>
            Your browser does not support passkeys.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Fingerprint className="h-5 w-5 text-primary" />
              Biometric Login
            </CardTitle>
            <CardDescription>
              Use your fingerprint, face, or device PIN to sign in.
            </CardDescription>
          </div>
          <Button onClick={handleRegister} disabled={isRegistering} size="sm" className="gap-2">
            {isRegistering ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Add Passkey
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : passkeys.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Shield className="h-10 w-10 text-muted-foreground/40" />
            <p className="mt-2 text-sm text-muted-foreground">No passkeys registered.</p>
            <p className="text-xs text-muted-foreground/60">
              Add a passkey to enable biometric login.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {passkeys.map((pk) => (
              <div
                key={pk.id}
                className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/5 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <Fingerprint className="h-5 w-5 text-primary-400" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {pk.deviceType === "single-device" ? "This Device" : "Security Key"}
                    </p>
                    <div className="flex gap-2 text-xs text-muted-foreground">
                      <span>{formatTransports(pk.transports)}</span>
                      {pk.backedUp && (
                        <Badge variant="outline" className="text-[10px]">Backed up</Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right text-xs text-muted-foreground">
                    <p>Last used: {formatDate(pk.lastUsedAt)}</p>
                    <p>Added: {formatDate(pk.createdAt)}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(pk.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
