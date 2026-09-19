"use client";

import { Layers, Plus, Search, LayoutTemplate } from "lucide-react";
import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableTreeNode } from "./sortable-tree-node";
import { useDevModeStore } from "@/stores/devModeStore";
import { usePageBuilderStore } from "@/stores/pageBuilderStore";
import { blockRegistry } from "@/lib/block-registry";

export interface TreeNodeData {
  id: string;
  type: string;
  label: string;
  children?: TreeNodeData[];
  visible?: boolean;
  locked?: boolean;
}

interface StructureTreeProps {
  blocks: TreeNodeData[];
  onAddBlock?: (type: string) => void;
  onSelect?: (id: string) => void;
  onDelete?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onReorder?: (activeId: string, overId: string) => void;
  onToggleVisibility?: (id: string) => void;
  onToggleLock?: (id: string) => void;
}

export function StructureTree({ blocks, onAddBlock, onSelect, onDelete, onDuplicate, onReorder, onToggleVisibility, onToggleLock }: StructureTreeProps) {
  const [search, setSearch] = useState("");
  const [showTypePicker, setShowTypePicker] = useState(false);

  const enabled = useDevModeStore((s) => s.enabled);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  if (!enabled) return null;

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    onReorder?.(active.id as string, over.id as string);
  }

  function filterTree(nodes: TreeNodeData[], query: string): TreeNodeData[] {
    if (!query) return nodes;
    return nodes
      .map((node) => ({
        ...node,
        children: node.children ? filterTree(node.children, query) : undefined,
      }))
      .filter(
        (node) =>
          node.label.toLowerCase().includes(query.toLowerCase()) ||
          node.type.toLowerCase().includes(query.toLowerCase()) ||
          (node.children && node.children.length > 0),
      );
  }

  const filtered = search ? filterTree(blocks, search) : blocks;

  function renderSortableNode(node: TreeNodeData, depth: number) {
    const hasChildren = node.children && node.children.length > 0;
    return (
      <div key={node.id}>
        <SortableTreeNode
          node={node}
          depth={depth}
          onSelect={(id) => {
            useDevModeStore.getState().select(id);
            usePageBuilderStore.getState().selectSection(id);
            onSelect?.(id);
          }}
          onToggleVisibility={(id) => onToggleVisibility?.(id)}
          onToggleLock={(id) => onToggleLock?.(id)}
          onDuplicate={(id) => onDuplicate?.(id)}
          onDelete={(id) => onDelete?.(id)}
        />
        {hasChildren && (
          <div>
            {node.children!.map((child: TreeNodeData) => renderSortableNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  }

  function getAllIds(nodes: TreeNodeData[]): string[] {
    const ids: string[] = [];
    for (const n of nodes) {
      ids.push(n.id);
      if (n.children) ids.push(...getAllIds(n.children));
    }
    return ids;
  }

  const allIds = getAllIds(blocks);

  return (
    <div className="flex h-full flex-col bg-background/50 backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-primary-500" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground">Layers</span>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowTypePicker(!showTypePicker)}
            className="rounded-lg p-1 text-muted-foreground transition-all hover:bg-muted hover:text-foreground active:scale-95"
          >
            <Plus className="h-4 w-4" />
          </button>
          {showTypePicker && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowTypePicker(false)} />
              <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(11,13,16,0.98)] p-1.5 shadow-xl backdrop-blur-xl">
                <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Add Block
                </p>
                <div className="mt-1 space-y-0.5">
                  {blockRegistry.getByScope("page").map(([type, entry]) => (
                    <button
                      key={type}
                      onClick={() => {
                        setShowTypePicker(false);
                        onAddBlock?.(type);
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-foreground transition-colors hover:bg-glass"
                    >
                      <LayoutTemplate className="h-3.5 w-3.5 text-muted-foreground" />
                      {entry.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="px-4 py-3">
        <div className="flex items-center gap-2 rounded-xl bg-muted/20 px-3 py-2 border border-border/50 transition-all focus-within:border-primary-500/50 focus-within:bg-background">
          <Search className="h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search layers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-[11px] font-medium text-foreground placeholder-muted-foreground/60 outline-none"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Layers className="mb-2 h-8 w-8 text-muted-foreground/30" />
            <p className="text-xs text-muted-foreground">
              {search ? "No layers match your search" : "No blocks yet"}
            </p>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={allIds} strategy={verticalListSortingStrategy}>
              <div className="space-y-0.5">
                {filtered.map((node) => renderSortableNode(node, 0))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}
