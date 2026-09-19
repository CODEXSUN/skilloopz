import { WifiOff, BookOpen, RotateCcw } from "lucide-react";
import Link from "next/link";

import { OfflineLessons } from "@/components/offline/offline-lessons";
import { Button } from "@/components/ui/button";

export default function OfflinePage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8 p-6">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10">
          <WifiOff className="h-8 w-8 text-amber-400" />
        </div>
        <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
          You&apos;re Offline
        </h1>
        <p className="mt-2 text-muted-foreground">
          Some features are unavailable without an internet connection.
        </p>
      </div>

      <div className="flex justify-center">
        <Button asChild className="gap-2">
          <Link href="/">
            <RotateCcw className="h-4 w-4" />
            Try Again
          </Link>
        </Button>
      </div>

      <OfflineLessons />

      <div className="rounded-lg border border-border/50 bg-muted/5 p-6">
        <h2 className="font-heading text-lg font-bold text-foreground">Tips for Offline Use</h2>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <BookOpen className="h-4 w-4 mt-0.5 text-primary-400" />
            Cache lessons while online to read them later
          </li>
          <li className="flex items-start gap-2">
            <BookOpen className="h-4 w-4 mt-0.5 text-primary-400" />
            Your progress will sync automatically when you reconnect
          </li>
          <li className="flex items-start gap-2">
            <BookOpen className="h-4 w-4 mt-0.5 text-primary-400" />
            Quizzes can be completed offline and submitted later
          </li>
        </ul>
      </div>
    </div>
  );
}
