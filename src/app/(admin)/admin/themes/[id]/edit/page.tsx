"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { ErrorState } from "@/components/ui/error-state";
import { ThemeEditor } from "@/components/admin/themes/theme-editor";

export default function EditThemePage() {
  const queryClient = useQueryClient();
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [themeData, setThemeData] = useState<{ name: string; tokens: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/admin/themes/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Theme not found");
        return res.json();
      })
      .then((data) => {
        setThemeData({ name: data.name, tokens: data.tokens });
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setIsLoading(false);
      });
  }, [id]);

  async function handleSave(name: string, tokens: string) {
    const res = await fetch(`/api/admin/themes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, tokens }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(typeof data.error === "string" ? data.error : "Failed to save");
    }
    setThemeData({ name, tokens });
    queryClient.invalidateQueries({ queryKey: ["activeTheme"] });
  }

  if (isLoading) return <LoadingScreen message="Loading theme..." />;

  if (error || !themeData) {
    return (
      <div className="p-6">
        <ErrorState message={error ?? "Theme not found"} onRetry={() => router.refresh()} />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <div className="flex items-center gap-4 border-b border-border px-6 py-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/admin/themes")}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <h1 className="text-lg font-semibold text-foreground">
          Edit Theme
        </h1>
      </div>
      <div className="flex-1 overflow-hidden">
        <ThemeEditor
          initialName={themeData.name}
          initialTokens={themeData.tokens}
          onSave={handleSave}
        />
      </div>
    </div>
  );
}
