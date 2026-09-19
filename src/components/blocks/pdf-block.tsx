"use client";

import { PdfPreview } from "@/components/blocks/pdf-preview";

interface PdfContent {
  url?: string;
  title?: string;
}

interface PdfBlockProps {
  content: Record<string, unknown>;
}

export function PdfBlock({ content }: PdfBlockProps) {
  const { url, title } = content as PdfContent;

  if (!url) {
    return (
      <div className="rounded-lg border border-dashed border-border p-8 text-center text-tertiary-foreground">
        No PDF URL provided
      </div>
    );
  }

  return <PdfPreview url={url} title={title} />;
}
