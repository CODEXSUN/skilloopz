"use client";

import { useQuery } from "@tanstack/react-query";
import { WorldCard } from "./world-card";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { StaggerContainer, StaggerItem } from "@/components/ui/motion";
import { Globe } from "lucide-react";

interface World {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  order: number;
  islandCount: number;
  progress: { completed: number; total: number } | null;
}

export function WorldsContent() {
  const { data: worlds, isLoading, error } = useQuery<World[]>({
    queryKey: ["worlds"],
    queryFn: async () => {
      const res = await fetch("/api/worlds");
      if (!res.ok) throw new Error("Failed to fetch worlds");
      return res.json();
    },
  });

  if (isLoading) return <LoadingScreen />;
  if (error) return <ErrorState message={error.message} />;
  if (!worlds?.length) {
    return (
      <EmptyState
        icon={Globe}
        title="No worlds available"
        description="Learning worlds are being created. Check back soon!"
      />
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Learning Worlds</h1>
        <p className="mt-2 text-muted-foreground">
          Explore themed worlds, master concepts, and unlock new adventures.
        </p>
      </div>

      <StaggerContainer>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {worlds.map((world) => (
            <StaggerItem key={world.id}>
              <WorldCard {...world} />
            </StaggerItem>
          ))}
        </div>
      </StaggerContainer>
    </div>
  );
}