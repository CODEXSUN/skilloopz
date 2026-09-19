"use client";

import { createElement } from "react";
import { blockRegistry } from "@/lib/block-registry";

interface BlockData {
  id: string;
  type: string;
  lessonId?: string;
  [key: string]: unknown;
}

interface BlockRendererProps {
  block: BlockData;
  lessonId?: string;
}

function renderBlockContent(block: BlockData, lessonId?: string) {
  const component = blockRegistry.getComponent(block.type);
  if (!component) {
    return (
      <div className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
        Unknown block type: <code className="text-sm">{block.type}</code>
      </div>
    );
  }
  return createElement(component, {
    content: block.content as Record<string, unknown>,
    lessonId: lessonId ?? block.lessonId ?? "",
    blockId: block.id,
  });
}

export function BlockRenderer({ block, lessonId }: BlockRendererProps) {
  if (!block) {
    return <p className="text-muted-foreground">No block to display.</p>;
  }

  return renderBlockContent(block, lessonId);
}
