"use client";

import { useState } from "react";

interface PdfPreviewProps {
  url: string;
  title?: string;
}

export function PdfPreview({ url, title }: PdfPreviewProps) {
  const [fallback, setFallback] = useState(false);

  return (
    <div className="rounded-lg border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] overflow-hidden">
      {title && (
        <div className="border-b border-[rgba(255,255,255,0.06)] px-4 py-3">
          <p className="text-sm font-medium text-foreground">{title}</p>
        </div>
      )}
      <div className="relative">
        {fallback ? (
          <div className="flex items-center justify-center p-12 text-center">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Your browser does not support embedded PDFs.
              </p>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 items-center rounded-lg bg-foreground px-4 text-sm font-medium text-background transition-opacity hover:opacity-90"
              >
                Download PDF
              </a>
            </div>
          </div>
        ) : (
          <iframe
            src={url}
            className="h-[600px] w-full"
            title={title ?? "PDF preview"}
            onError={() => setFallback(true)}
          />
        )}
      </div>
    </div>
  );
}
