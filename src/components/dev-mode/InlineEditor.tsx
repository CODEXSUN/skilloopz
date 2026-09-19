"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { useDevModeStore } from "@/stores/devModeStore";

interface InlineEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  multiline?: boolean;
}

export function InlineEditor({ value, onChange, className = "", placeholder = "", multiline = false }: InlineEditorProps) {
  const devModeEnabled = useDevModeStore((s) => s.enabled);
  const ref = useRef<HTMLSpanElement>(null);
  const [editing, setEditing] = useState(false);
  const [internalValue, setInternalValue] = useState(value);
  const [prevValue, setPrevValue] = useState(value);

  if (value !== prevValue) {
    setPrevValue(value);
    if (!editing) {
      setInternalValue(value);
    }
  }

  function handleDoubleClick() {
    if (!devModeEnabled) return;
    setEditing(true);
    setTimeout(() => {
      ref.current?.focus();
      const sel = window.getSelection();
      if (sel && ref.current) {
        sel.selectAllChildren(ref.current);
      }
    }, 0);
  }

  function handleBlur() {
    setEditing(false);
    const text = ref.current?.textContent ?? "";
    if (text !== value) {
      onChange(text);
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (!multiline && e.key === "Enter") {
      e.preventDefault();
      ref.current?.blur();
    }
    if (e.key === "Escape") {
      e.preventDefault();
      setInternalValue(value);
      ref.current!.textContent = value;
      ref.current?.blur();
    }
  }

  return (
    <span
      ref={ref}
      contentEditable={editing}
      suppressContentEditableWarning
      onDoubleClick={handleDoubleClick}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onInput={() => {
        const text = ref.current?.textContent ?? "";
        setInternalValue(text);
        if (editing) {
          onChange(text);
        }
      }}
      data-placeholder={placeholder}
      className={`${className} ${
        editing
          ? "outline-dashed outline-1 outline-primary-500/50 cursor-text"
          : "cursor-pointer hover:outline-dotted hover:outline-1 hover:outline-primary-500/30"
      }`}
      style={{ 
        whiteSpace: multiline ? "pre-wrap" : "nowrap",
        display: multiline ? "block" : "inline-block",
        minWidth: "1em",
        minHeight: "1em"
      }}
    >
      {internalValue || placeholder}
    </span>
  );
}
