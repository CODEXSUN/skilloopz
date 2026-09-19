"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { ArrowRight, Compass } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingScreen } from "@/components/ui/loading-screen";

interface PathData {
  currentWorld: string | null;
  currentIsland: string | null;
  islandId: string | null;
  worldId: string | null;
  progress: number;
  status: string;
}

export function NextUp() {
  const { data, isLoading } = useQuery<PathData>({
    queryKey: ["path-current"],
    queryFn: async () => {
      const res = await fetch("/api/path/current");
      if (!res.ok) throw new Error("Failed to fetch current path");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="p-4 pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Compass className="h-4 w-4 text-blue-400" />
            Next Up
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  return (
    <Card>
      <CardHeader className="p-4 pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Compass className="h-4 w-4 text-blue-400" />
          Next Up
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <p className="text-sm text-muted-foreground">Continue your journey in</p>
        <p className="mt-1 font-semibold text-foreground">{data.currentWorld ?? "Learning Worlds"}</p>
        <p className="text-sm text-muted-foreground">
          Island: {data.currentIsland ?? "Getting started..."}
        </p>
        {data.worldId && data.islandId && (
          <Button asChild variant="outline" size="sm" className="mt-3 w-full">
            <Link href={`/worlds/${data.worldId}/islands/${data.islandId}`}>
              {data.status === "locked" ? "Unlock" : data.status === "completed" ? "Review" : "Continue"}
              <ArrowRight className="ml-2 h-3 w-3" />
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}