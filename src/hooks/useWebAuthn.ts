"use client";

import { useCallback } from "react";

interface CredentialCreationResult {
  id: string;
  rawId: string;
  response: {
    clientDataJSON: string;
    attestationObject: string;
    transports?: string[];
  };
  type: "public-key";
}

interface CredentialRequestResult {
  id: string;
  rawId: string;
  response: {
    clientDataJSON: string;
    authenticatorData: string;
    signature: string;
    userHandle: string | null;
  };
  type: "public-key";
}

export function useWebAuthn() {
  const isSupported = typeof PublicKeyCredential !== "undefined";

  const register = useCallback(async (email: string, userName: string): Promise<CredentialCreationResult | null> => {
    if (!isSupported) return null;

    try {
      const res = await fetch("/api/auth/passkey/register-options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, userName }),
      });

      if (!res.ok) return null;

      const options = await res.json();

      const credential = (await navigator.credentials.create({
        publicKey: {
          ...options,
          challenge: base64urlToBuffer(options.challenge),
          user: {
            ...options.user,
            id: base64urlToBuffer(options.user.id),
          },
          excludeCredentials: options.excludeCredentials?.map((c: Record<string, string>) => ({
            ...c,
            id: base64urlToBuffer(c.id),
          })),
        },
      })) as PublicKeyCredential;

      if (!credential) return null;

      const attestationResponse = credential.response as AuthenticatorAttestationResponse;

      return {
        id: credential.id,
        rawId: bufferToBase64url(new Uint8Array(credential.rawId)),
        response: {
          clientDataJSON: bufferToBase64url(new Uint8Array(attestationResponse.clientDataJSON)),
          attestationObject: bufferToBase64url(new Uint8Array(attestationResponse.attestationObject)),
          transports: typeof attestationResponse.getTransports === "function"
            ? attestationResponse.getTransports()
            : [],
        },
        type: "public-key",
      };
    } catch (error) {
      console.error("WebAuthn registration failed:", error);
      return null;
    }
  }, [isSupported]);

  const authenticate = useCallback(async (): Promise<CredentialRequestResult | null> => {
    if (!isSupported) return null;

    try {
      const res = await fetch("/api/auth/passkey/authenticate-options", {
        method: "POST",
      });

      if (!res.ok) return null;

      const options = await res.json();

      const credential = (await navigator.credentials.get({
        publicKey: {
          ...options,
          challenge: base64urlToBuffer(options.challenge),
          allowCredentials: options.allowCredentials?.map((c: Record<string, string>) => ({
            ...c,
            id: base64urlToBuffer(c.id),
          })),
        },
      })) as PublicKeyCredential;

      if (!credential) return null;

      const assertionResponse = credential.response as AuthenticatorAssertionResponse;

      return {
        id: credential.id,
        rawId: bufferToBase64url(new Uint8Array(credential.rawId)),
        response: {
          clientDataJSON: bufferToBase64url(new Uint8Array(assertionResponse.clientDataJSON)),
          authenticatorData: bufferToBase64url(new Uint8Array(assertionResponse.authenticatorData)),
          signature: bufferToBase64url(new Uint8Array(assertionResponse.signature)),
          userHandle: assertionResponse.userHandle
            ? bufferToBase64url(new Uint8Array(assertionResponse.userHandle))
            : null,
        },
        type: "public-key",
      };
    } catch (error) {
      console.error("WebAuthn authentication failed:", error);
      return null;
    }
  }, [isSupported]);

  return { isSupported, register, authenticate };
}

function base64urlToBuffer(base64url: string): ArrayBuffer {
  const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  const padLength = (4 - (base64.length % 4)) % 4;
  const padded = base64 + "=".repeat(padLength);
  const binary = atob(padded);
  const buffer = new ArrayBuffer(binary.length);
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return buffer;
}

function bufferToBase64url(buffer: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < buffer.length; i++) {
    binary += String.fromCharCode(buffer[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}
