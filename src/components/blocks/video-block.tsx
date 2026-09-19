"use client";

import { useMemo } from "react";

interface VideoContent {
  url?: string;
  provider?: "youtube" | "vimeo" | "direct";
  caption?: string;
  poster_url?: string;
  transcript?: string;
}

interface VideoBlockProps {
  content: Record<string, unknown>;
}

function getYouTubeEmbedId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]+)/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]+)/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function getVimeoEmbedId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(\d+)/);
  return match ? match[1] : null;
}

export function VideoBlock({ content }: VideoBlockProps) {
  const { url, provider, caption, transcript } = content as VideoContent;

  const embedUrl = useMemo(() => {
    if (!url) return null;

    if (provider === "youtube") {
      const id = getYouTubeEmbedId(url);
      return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
    }

    if (provider === "vimeo") {
      const id = getVimeoEmbedId(url);
      return id ? `https://player.vimeo.com/video/${id}` : null;
    }

    return url; // direct URL
  }, [url, provider]);

  if (!url) {
    return (
      <div className="rounded-lg border border-dashed border-border p-8 text-center text-tertiary-foreground">
        No video URL provided
      </div>
    );
  }

  if (provider === "direct") {
    return (
      <div className="space-y-2">
        <video
          controls
          className="w-full rounded-lg"
          poster={(content as VideoContent).poster_url}
        >
          <source src={url} />
        </video>
        {caption && (
          <p className="text-center text-sm text-muted-foreground">{caption}</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="aspect-video overflow-hidden rounded-lg bg-black">
        {embedUrl ? (
          <iframe
            src={embedUrl}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div className="flex h-full items-center justify-center text-white">
            Invalid video URL
          </div>
        )}
      </div>
      {caption && (
        <p className="text-center text-sm text-muted-foreground">{caption}</p>
      )}
      {transcript && (
        <details className="group">
          <summary className="cursor-pointer text-sm font-medium text-foreground hover:text-foreground">
            Show transcript
          </summary>
          <div className="mt-2 rounded-lg bg-muted p-4 text-sm text-muted-foreground">
            {transcript}
          </div>
        </details>
      )}
    </div>
  );
}
