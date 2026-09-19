"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { ErrorState } from "@/components/ui/error-state";
import { BlockTypeEditor } from "@/components/admin/blocks/block-type-editor";
import type { BlockDefinition } from "@/components/admin/blocks/block-library";

export default function EditBlockPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [block, setBlock] = useState<BlockDefinition | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/admin/blocks/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Block type not found");
        return res.json();
      })
      .then((data) => {
        setBlock(data);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setIsLoading(false);
      });
  }, [id]);

  if (isLoading) return <LoadingScreen message="Loading block..." />;

  if (error || !block) {
    return (
      <div className="p-6">
        <ErrorState message={error ?? "Block not found"} onRetry={() => router.refresh()} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/admin/blocks")}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>
      <BlockTypeEditor block={block} />
    </div>
  );
}
