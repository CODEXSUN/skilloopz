import { describe, it, expect } from "vitest";
import { checkRateLimit, getRateLimitRemaining } from "@/lib/rate-limit";

describe("rate-limit", () => {
  it("allows first request", () => {
    const key = `test:${Date.now()}`;
    expect(checkRateLimit(key)).toBe(true);
  });

  it("blocks after 5 attempts", () => {
    const key = `block:${Date.now()}`;
    for (let i = 0; i < 5; i++) {
      expect(checkRateLimit(key)).toBe(true);
    }
    expect(checkRateLimit(key)).toBe(false);
  });

  it("reports remaining correctly", () => {
    const key = `remain:${Date.now()}`;
    expect(getRateLimitRemaining(key)).toBe(5);
    checkRateLimit(key);
    expect(getRateLimitRemaining(key)).toBe(4);
  });
});
