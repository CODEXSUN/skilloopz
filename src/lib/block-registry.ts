import { ComponentType } from "react";
import type { BlockComponentProps, EditorComponentProps, RegistryEntry } from "@/types/registry";

class BlockRegistry {
  private entries = new Map<string, RegistryEntry>();

  register(type: string, entry: RegistryEntry): void {
    if (this.entries.has(type)) {
      console.warn(`Block type "${type}" is already registered. Overwriting.`);
    }
    this.entries.set(type, entry);
  }

  getComponent(type: string): ComponentType<BlockComponentProps> | null {
    return this.entries.get(type)?.component ?? null;
  }

  getEditor(type: string): ComponentType<EditorComponentProps> | null {
    return this.entries.get(type)?.editor ?? null;
  }

  has(type: string): boolean {
    return this.entries.has(type);
  }

  getAll(): [string, RegistryEntry][] {
    return Array.from(this.entries.entries());
  }

  getKeys(): string[] {
    return Array.from(this.entries.keys());
  }

  getByScope(scope: "lesson" | "page" | "both"): [string, RegistryEntry][] {
    return this.getAll().filter(([, entry]) => entry.scope === scope || entry.scope === "both");
  }
}

export const blockRegistry = new BlockRegistry();
