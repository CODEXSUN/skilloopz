"use client";

import { useRouter } from "next/navigation";
import { Check, Palette } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ThemeCardProps {
  id: string;
  name: string;
  isActive: boolean;
  tokens: string;
  onActivate: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ThemeCard({ id, name, isActive, tokens, onActivate, onDelete }: ThemeCardProps) {
  const router = useRouter();

  let parsedTokens: Record<string, string> = {};
  try {
    const t = JSON.parse(tokens);
    if (t.colors) parsedTokens = t.colors;
  } catch {
    // ignore
  }

  const primaryColor = parsedTokens.primary ?? "#7c3aed";
  const bgColor = parsedTokens.background ?? "#ffffff";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg"
              style={{ backgroundColor: primaryColor }}
            >
              <Palette className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                {name}
                {isActive && (
                  <Badge variant="default" className="text-[10px]">
                    Active
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                <div className="mt-1 flex gap-1">
                  <span
                    className="inline-block h-4 w-4 rounded-full border border-border"
                    style={{ backgroundColor: primaryColor }}
                  />
                  <span
                    className="inline-block h-4 w-4 rounded-full border border-border"
                    style={{ backgroundColor: parsedTokens.secondary ?? "#06b6d4" }}
                  />
                  <span
                    className="inline-block h-4 w-4 rounded-full border border-border"
                    style={{ backgroundColor: parsedTokens.accent ?? "#f59e0b" }}
                  />
                  <span
                    className="inline-block h-4 w-4 rounded-full border border-border"
                    style={{ backgroundColor: bgColor }}
                  />
                </div>
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <div className="flex gap-2 border-t border-border px-6 py-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/admin/themes/${id}/edit`)}
        >
          Edit
        </Button>
        {!isActive && (
          <Button variant="ghost" size="sm" onClick={() => onActivate(id)}>
            <Check className="h-4 w-4" />
            Activate
          </Button>
        )}
        {!isActive && (
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => onDelete(id)}
          >
            Delete
          </Button>
        )}
      </div>
    </Card>
  );
}
