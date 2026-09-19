import { ComponentType } from "react";

export interface BlockComponentProps {
  content: Record<string, unknown>;
  lessonId?: string;
  blockId?: string;
}

export interface EditorComponentProps {
  content: Record<string, unknown>;
  onChange: (content: Record<string, unknown>) => void;
}

export interface RegistryEntry {
  component: ComponentType<BlockComponentProps>;
  editor?: ComponentType<EditorComponentProps>;
  label: string;
  scope: "lesson" | "page" | "both";
}
