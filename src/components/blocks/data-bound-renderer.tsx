"use client";

import { useEffect, useState, useRef } from "react";
import { blockRegistry } from "@/lib/block-registry";

interface DataBindingConfig {
  sourceType?: string;
  filters?: Record<string, string>;
  limit?: number;
  fieldMapping?: Record<string, string>;
  cacheDuration?: number;
  fallbackDisplay?: string;
  sortField?: string;
  sortOrder?: "asc" | "desc";
}

interface DataBoundRendererProps {
  section: {
    id: string;
    blockType: string;
    content: Record<string, unknown>;
    settings: { dataBinding?: DataBindingConfig; [key: string]: unknown };
  };
}

export function DataBoundRenderer({ section }: DataBoundRendererProps) {
  const db = section.settings?.dataBinding;
  const [boundData, setBoundData] = useState<unknown[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cacheKey = useRef<string>("");

  useEffect(() => {
    if (!db?.sourceType) {
      setBoundData(null);
      setLoading(false);
      setError(null);
      return;
    }

    const key = JSON.stringify({ type: db.sourceType, filters: db.filters, limit: db.limit });
    if (key === cacheKey.current && boundData !== null) return;
    cacheKey.current = key;

    setLoading(true);
    setError(null);

    fetch("/api/admin/data-binding/preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: db.sourceType, filters: db.filters ?? {}, limit: db.limit }),
    })
      .then((r) => { if (!r.ok) throw new Error("Failed to resolve data source"); return r.json(); })
      .then((res) => setBoundData(res.data ?? []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [db?.sourceType, db?.filters, db?.limit]);

  const SectionComponent = blockRegistry.getComponent(section.blockType);

  if (!db?.sourceType) {
    return SectionComponent
      ? <SectionComponent content={section.content} blockId={section.id} />
      : <div className="py-6 text-center text-sm text-muted-foreground">Unknown section type: {section.blockType}</div>;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
          Loading data...
        </div>
      </div>
    );
  }

  if (error || !boundData || boundData.length === 0) {
    const fallback = db.fallbackDisplay || "No data available";
    return (
      <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
        {fallback}
      </div>
    );
  }

  const mappedContent = {
    ...section.content,
    boundData,
    boundItems: boundData,
    boundCount: boundData.length,
  };

  return SectionComponent
    ? <SectionComponent content={mappedContent} blockId={section.id} />
    : <div className="py-6 text-center text-sm text-muted-foreground">Unknown section type: {section.blockType}</div>;
}
