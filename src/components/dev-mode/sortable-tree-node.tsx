"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChevronRight, GripVertical, Eye, EyeOff, Trash2, Copy, Lock, Unlock } from "lucide-react";
import type { TreeNodeData } from "./StructureTree";
import { useDevModeStore } from "@/stores/devModeStore";

interface SortableTreeNodeProps {
  node: TreeNodeData;
  depth: number;
  onSelect?: (id: string) => void;
  onToggleVisibility?: (id: string) => void;
  onToggleLock?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function SortableTreeNode({ node, depth, onSelect, onToggleVisibility, onToggleLock, onDuplicate, onDelete }: SortableTreeNodeProps) {
  const [expanded, setExpanded] = useState(true);
  const selectedId = useDevModeStore((s) => s.selectedId);
  const isSelected = selectedId === node.id;
  const hasChildren = node.children && node.children.length > 0;
  const isLocked = node.locked ?? false;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: node.id, disabled: isLocked });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : undefined,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} className={`mb-0.5 ${isDragging ? "relative" : ""}`}>
      <div
        className={`group flex items-center gap-2 rounded-xl px-3 py-2 text-[11px] font-medium transition-all cursor-pointer ${
          isSelected
            ? "bg-primary-500 text-white shadow-[0_4px_12px_rgba(79,124,255,0.3)]"
            : "text-foreground/70 hover:bg-muted/30 hover:text-foreground"
        }`}
        style={{ paddingLeft: `${12 + depth * 16}px` }}
        onClick={() => onSelect?.(node.id)}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
          className={`flex h-4 w-4 items-center justify-center transition-transform ${
            hasChildren ? "opacity-60 hover:opacity-100" : "opacity-0 pointer-events-none"
          } ${expanded ? "rotate-90" : ""}`}
        >
          <ChevronRight className="h-3 w-3" />
        </button>

        <button
          {...attributes}
          {...listeners}
          className={`flex h-4 w-4 items-center justify-center ${isLocked ? "cursor-not-allowed opacity-20" : "cursor-grab active:cursor-grabbing"} opacity-0 group-hover:opacity-30 transition-opacity`}
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className={`h-3.5 w-3.5 ${isLocked ? "text-muted-foreground/30" : ""}`} />
        </button>

        <div className="flex flex-1 items-center gap-2 truncate">
          <div className={`h-1.5 w-1.5 rounded-full ${isSelected ? "bg-white" : "bg-primary-500/40"}`} />
          <span className="truncate">
            <span className={`text-[9px] font-bold uppercase tracking-wider ${isSelected ? "text-white/60" : "text-muted-foreground/50"}`}>
              {node.type}
            </span>{" "}
            {node.label}
          </span>
        </div>

        <div className={`flex items-center gap-1 transition-opacity ${isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleLock?.(node.id);
            }}
            className={`rounded-md p-1 transition-all ${isSelected ? "hover:bg-white/20" : "hover:bg-glass"}`}
            title={isLocked ? "Unlock" : "Lock"}
          >
            {isLocked ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleVisibility?.(node.id);
            }}
            className={`rounded-md p-1 transition-all ${isSelected ? "hover:bg-white/20" : "hover:bg-glass"}`}
            title={node.visible !== false ? "Hide" : "Show"}
          >
            {node.visible !== false ? (
              <Eye className="h-3 w-3" />
            ) : (
              <EyeOff className="h-3 w-3 opacity-40" />
            )}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate?.(node.id);
            }}
            className={`rounded-md p-1 transition-all ${isSelected ? "hover:bg-white/20" : "hover:bg-glass"}`}
            title="Duplicate"
          >
            <Copy className="h-3 w-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (!isLocked) onDelete?.(node.id);
            }}
            className={`rounded-md p-1 transition-all ${isSelected ? "hover:bg-white/20" : "hover:bg-red-500/40"} ${isLocked ? "opacity-30 cursor-not-allowed" : ""}`}
            title={isLocked ? "Locked" : "Delete"}
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>

      {hasChildren && expanded && (
        <div>
          {node.children!.map((child: TreeNodeData) => (
            <SortableTreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              onSelect={onSelect}
              onToggleVisibility={onToggleVisibility}
              onToggleLock={onToggleLock}
              onDuplicate={onDuplicate}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
