"use client";

import { useRouter } from "next/navigation";
import {
  FileText,
  Video,
  HelpCircle,
  Copy,
  Image,
  Headphones,
  Code,
  Terminal,
  Paperclip,
  Minus,
  type LucideIcon,
} from "lucide-react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface BlockField {
  key: string;
  label: string;
  type: string;
  required?: boolean;
}

export interface BlockDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  fields: BlockField[];
}

const iconMap: Record<string, LucideIcon> = {
  FileText,
  Video,
  HelpCircle,
  Copy,
  Image,
  Headphones,
  Code,
  Terminal,
  Paperclip,
  Minus,
};

interface BlockLibraryProps {
  blocks: BlockDefinition[];
}

export function BlockLibrary({ blocks }: BlockLibraryProps) {
  const router = useRouter();

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {blocks.map((block) => {
        const Icon = iconMap[block.icon] ?? FileText;
        const requiredFields = block.fields.filter((f) => f.required).length;
        const totalFields = block.fields.length;

        return (
          <Card
            key={block.id}
            className="cursor-pointer transition-shadow hover:shadow-md"
            onClick={() => router.push(`/admin/blocks/${block.id}/edit`)}
          >
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-100">
                  <Icon className="h-5 w-5 text-primary-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="truncate">{block.name}</CardTitle>
                    <Badge variant="outline" className="shrink-0 text-[10px]">
                      {block.id}
                    </Badge>
                  </div>
                  <CardDescription className="mt-1">
                    {block.description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <div className="border-t border-border px-6 py-2 text-xs text-muted-foreground">
              {totalFields > 0
                ? `${requiredFields} required · ${totalFields} total fields`
                : "No configurable fields"}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
