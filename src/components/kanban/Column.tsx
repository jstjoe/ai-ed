"use client";

import { useDroppable } from "@dnd-kit/core";
import { Plus } from "lucide-react";
import type { StatusKind } from "@/lib/duration";

export function Column({
  id,
  name,
  color,
  kind,
  count,
  onAdd,
  children,
}: {
  id: string;
  name: string;
  color: string;
  kind: StatusKind;
  count: number;
  onAdd: () => void;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={`flex w-72 shrink-0 flex-col rounded-lg border border-border bg-muted/40 p-2 ${
        isOver ? "ring-2 ring-primary/30" : ""
      }`}
    >
      <div className="mb-2 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: color }}
            aria-hidden
          />
          <span className="text-sm font-medium">{name}</span>
          <span className="text-xs text-muted-foreground">{count}</span>
          {kind !== "ACTIVE" && (
            <span className="chip text-[10px] uppercase tracking-wide">
              {kind === "DONE" ? "Done" : "Cancelled"}
            </span>
          )}
        </div>
        <button
          className="btn-ghost h-6 w-6 p-0"
          onClick={onAdd}
          aria-label={`Add task to ${name}`}
        >
          <Plus size={14} />
        </button>
      </div>
      <div className="flex flex-1 flex-col gap-2">{children}</div>
    </div>
  );
}
