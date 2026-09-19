"use client";

import { useEffect } from "react";

export function GlobalErrorCatcher() {
  useEffect(() => {
    function handleError(event: ErrorEvent) {
      const payload = {
        message: event.error?.message ?? event.message ?? "Unknown error",
        stack: event.error?.stack,
        level: "error" as const,
        source: "frontend" as const,
        url: window.location.href,
        metadata: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          userAgent: navigator.userAgent,
        },
      };

      fetch("/api/admin/error-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).catch(() => {});
    }

    function handleRejection(event: PromiseRejectionEvent) {
      const payload = {
        message: event.reason?.message ?? String(event.reason),
        stack: event.reason?.stack,
        level: "error" as const,
        source: "frontend" as const,
        url: window.location.href,
        metadata: {
          type: "unhandled_promise_rejection",
          userAgent: navigator.userAgent,
        },
      };

      fetch("/api/admin/error-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).catch(() => {});
    }

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleRejection);
    };
  }, []);

  return null;
}
