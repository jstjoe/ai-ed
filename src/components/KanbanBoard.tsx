"use client";

import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { Status, Task } from "@/lib/types";
import { TaskCard } from "./TaskCard";
import { TaskForm } from "./TaskForm";

function Column({
  status,
  tasks,
  onAdd,
  onEdit,
}: {
  status: Status;
  tasks: Task[];
  onAdd: (statusId: string) => void;
  onEdit: (task: Task) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `col:${status.id}`,
    data: { statusId: status.id },
  });
  return (
    <div className="flex h-full w-72 shrink-0 flex-col rounded-xl bg-neutral-100/60 dark:bg-neutral-900/60">
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: status.color }}
          />
          <span className="text-sm font-semibold">{status.name}</span>
          <span className="text-xs text-neutral-500">{tasks.length}</span>
        </div>
        <button
          onClick={() => onAdd(status.id)}
          className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
          aria-label={`Add task to ${status.name}`}
        >
          + Add
        </button>
      </div>
      <div
        ref={setNodeRef}
        className={`flex-1 space-y-2 overflow-y-auto p-2 transition-colors ${
          isOver ? "bg-neutral-200/60 dark:bg-neutral-800/60" : ""
        }`}
      >
        {tasks.map((t) => (
          <TaskCard key={t.id} task={t} onEdit={onEdit} />
        ))}
        {tasks.length === 0 && (
          <div className="rounded-md border border-dashed border-neutral-300 p-4 text-center text-xs text-neutral-400 dark:border-neutral-700">
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  );
}

export function KanbanBoard() {
  const tasks = useStore((s) => s.tasks);
  const statuses = useStore((s) => s.statuses);
  const moveTask = useStore((s) => s.moveTask);

  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [defaultStatusId, setDefaultStatusId] = useState<string | undefined>();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  );

  const tasksByStatus = useMemo(() => {
    const map: Record<string, Task[]> = {};
    statuses.forEach((s) => (map[s.id] = []));
    tasks.forEach((t) => {
      if (map[t.statusId]) map[t.statusId].push(t);
    });
    Object.values(map).forEach((arr) =>
      arr.sort((a, b) => a.order - b.order),
    );
    return map;
  }, [tasks, statuses]);

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over) return;
    const overId = String(over.id);
    if (!overId.startsWith("col:")) return;
    const statusId = overId.slice(4);
    moveTask(String(active.id), statusId);
  };

  const openNew = (statusId?: string) => {
    setEditingTask(null);
    setDefaultStatusId(statusId);
    setFormOpen(true);
  };

  const openEdit = (task: Task) => {
    setEditingTask(task);
    setDefaultStatusId(undefined);
    setFormOpen(true);
  };

  return (
    <>
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-base font-semibold">Board</h2>
        <button
          onClick={() => openNew()}
          className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
        >
          + New task
        </button>
      </div>
      <DndContext sensors={sensors} onDragEnd={onDragEnd}>
        <div className="flex gap-3 overflow-x-auto pb-3">
          {statuses.map((s) => (
            <Column
              key={s.id}
              status={s}
              tasks={tasksByStatus[s.id] ?? []}
              onAdd={openNew}
              onEdit={openEdit}
            />
          ))}
        </div>
      </DndContext>

      <TaskForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        task={editingTask}
        defaultStatusId={defaultStatusId}
      />
    </>
  );
}
