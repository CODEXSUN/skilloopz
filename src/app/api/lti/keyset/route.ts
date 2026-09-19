import { NextResponse } from "next/server";

const JWKS = {
  keys: [
    {
      kty: "RSA",
      use: "sig",
      alg: "RS256",
      n: process.env.LTI_PUBLIC_KEY_N || "demo",
      e: "AQAB",
    },
  ],
};

export async function GET() {
  return NextResponse.json(JWKS, {
    headers: { "Cache-Control": "public, max-age=3600" },
  });
}
