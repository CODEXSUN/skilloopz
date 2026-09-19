import { ComponentType } from "react";
import type { EditorComponentProps } from "@/types/registry";

class EditorRegistry {
  private entries = new Map<string, ComponentType<EditorComponentProps>>();

  register(type: string, editor: ComponentType<EditorComponentProps>): void {
    if (this.entries.has(type)) {
      console.warn(`Editor type "${type}" is already registered. Overwriting.`);
    }
    this.entries.set(type, editor);
  }

  get(type: string): ComponentType<EditorComponentProps> | null {
    return this.entries.get(type) ?? null;
  }

  has(type: string): boolean {
    return this.entries.has(type);
  }

  getKeys(): string[] {
    return Array.from(this.entries.keys());
  }
}

export const editorRegistry = new EditorRegistry();
