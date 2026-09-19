import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

interface LoadingScreenProps {
  fullScreen?: boolean;
  message?: string;
  className?: string;
}

export function LoadingScreen({
  fullScreen = true,
  message = "Loading...",
  className,
}: LoadingScreenProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3",
        fullScreen && "fixed inset-0 bg-white/80",
        className,
      )}
    >
      <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      {message && (
        <p className="text-sm text-muted-foreground">{message}</p>
      )}
    </div>
  );
}
