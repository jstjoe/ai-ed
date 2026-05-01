"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { STATUS_KINDS, type StatusKind } from "@/lib/duration";
import {
  createStatusAction,
  deleteStatusAction,
  reorderStatusesAction,
  updateStatusAction,
} from "@/lib/actions/statuses";

type Row = {
  id: string;
  name: string;
  color: string;
  order: number;
  kind: string;
  taskCount: number;
};

const KIND_LABEL: Record<StatusKind, string> = {
  ACTIVE: "Active",
  DONE: "Done",
  CANCELLED: "Cancelled",
};

export function StatusEditor({ initial }: { initial: Row[] }) {
  const [rows, setRows] = useState<Row[]>(initial);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const router = useRouter();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIdx = rows.findIndex((r) => r.id === active.id);
    const newIdx = rows.findIndex((r) => r.id === over.id);
    const next = arrayMove(rows, oldIdx, newIdx);
    setRows(next);
    startTransition(async () => {
      await reorderStatusesAction(next.map((r) => r.id));
      router.refresh();
    });
  }

  function patchRow(id: string, patch: Partial<Row>) {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function commitUpdate(id: string, patch: Partial<Row>) {
    setError(null);
    startTransition(async () => {
      try {
        await updateStatusAction({
          id,
          name: patch.name,
          color: patch.color,
          kind: patch.kind as StatusKind | undefined,
        });
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Update failed");
      }
    });
  }

  function addStatus() {
    setError(null);
    startTransition(async () => {
      try {
        const created = await createStatusAction({
          name: "New status",
          color: "#94a3b8",
          kind: "ACTIVE",
        });
        setRows((rs) => [
          ...rs,
          {
            id: created.id,
            name: created.name,
            color: created.color,
            order: created.order,
            kind: created.kind,
            taskCount: 0,
          },
        ]);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Create failed");
      }
    });
  }

  function removeStatus(row: Row) {
    setError(null);
    let reassignTo: string | undefined;
    if (row.taskCount > 0) {
      const others = rows.filter((r) => r.id !== row.id);
      const promptText =
        `"${row.name}" has ${row.taskCount} task(s). Move them to which status?\n\n` +
        others.map((r, i) => `${i + 1}. ${r.name}`).join("\n");
      const choice = window.prompt(promptText, "1");
      if (!choice) return;
      const idx = Number(choice) - 1;
      if (!Number.isInteger(idx) || idx < 0 || idx >= others.length) {
        setError("Invalid choice.");
        return;
      }
      reassignTo = others[idx].id;
    } else {
      if (!window.confirm(`Delete "${row.name}"?`)) return;
    }

    startTransition(async () => {
      try {
        await deleteStatusAction({ id: row.id, reassignTo });
        setRows((rs) => rs.filter((r) => r.id !== row.id));
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Delete failed");
      }
    });
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={rows.map((r) => r.id)}
          strategy={verticalListSortingStrategy}
        >
          <ul className="space-y-2">
            {rows.map((row) => (
              <SortableRow
                key={row.id}
                row={row}
                onChange={(p) => patchRow(row.id, p)}
                onCommit={(p) => commitUpdate(row.id, p)}
                onDelete={() => removeStatus(row)}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>

      <button className="btn-outline" onClick={addStatus}>
        <Plus size={14} /> Add status
      </button>
    </div>
  );
}

function SortableRow({
  row,
  onChange,
  onCommit,
  onDelete,
}: {
  row: Row;
  onChange: (patch: Partial<Row>) => void;
  onCommit: (patch: Partial<Row>) => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: row.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="card flex items-center gap-3 p-3"
    >
      <button
        className="cursor-grab text-muted-foreground hover:text-foreground"
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
      >
        <GripVertical size={16} />
      </button>

      <input
        type="color"
        value={row.color}
        onChange={(e) => onChange({ color: e.target.value })}
        onBlur={(e) => onCommit({ color: e.target.value })}
        className="h-8 w-10 cursor-pointer rounded border border-border bg-background"
        aria-label="Color"
      />

      <input
        className="input flex-1"
        value={row.name}
        onChange={(e) => onChange({ name: e.target.value })}
        onBlur={(e) => {
          if (e.target.value.trim() && e.target.value !== row.name)
            onCommit({ name: e.target.value });
          else if (!e.target.value.trim()) onChange({ name: row.name });
        }}
      />

      <select
        className="input w-32"
        value={row.kind}
        onChange={(e) => {
          const kind = e.target.value as StatusKind;
          onChange({ kind });
          onCommit({ kind });
        }}
      >
        {STATUS_KINDS.map((k) => (
          <option key={k} value={k}>
            {KIND_LABEL[k]}
          </option>
        ))}
      </select>

      <span className="w-16 text-right text-xs text-muted-foreground">
        {row.taskCount} {row.taskCount === 1 ? "task" : "tasks"}
      </span>

      <button
        className="btn-ghost text-red-600"
        onClick={onDelete}
        aria-label={`Delete ${row.name}`}
      >
        <Trash2 size={14} />
      </button>
    </li>
  );
}
