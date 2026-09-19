"use client";

import { useState, useEffect } from "react";

import { LoadingScreen } from "@/components/ui/loading-screen";
import { ErrorState } from "@/components/ui/error-state";
import {
  BlockLibrary,
  type BlockDefinition,
} from "@/components/admin/blocks/block-library";

export default function AdminBlocksPage() {
  const [blocks, setBlocks] = useState<BlockDefinition[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/blocks")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load blocks");
        return res.json();
      })
      .then((data) => {
        setBlocks(data);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) return <LoadingScreen fullScreen={false} message="Loading blocks..." />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Block Library</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage learning block types and their field schemas.
        </p>
      </div>
      {blocks && <BlockLibrary blocks={blocks} />}
    </div>
  );
}
