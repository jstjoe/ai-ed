"use client";

import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Column } from "./Column";
import { TaskCard, TaskCardPresentational } from "./TaskCard";
import { TaskDialog } from "./TaskDialog";
import { moveTaskAction } from "@/lib/actions/tasks";
import { useConfetti } from "@/components/Confetti";
import { Plus } from "lucide-react";

type Status = {
  id: string;
  name: string;
  color: string;
  order: number;
  kind: string;
  tasks: TaskRow[];
};

type TaskRow = {
  id: string;
  title: string;
  description: string | null;
  statusId: string;
  duration: string;
  priority: string;
  dueDate: Date | null;
  position: number;
};

export function Board({ statuses: initial }: { statuses: Status[] }) {
  const [statuses, setStatuses] = useState(initial);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<TaskRow | null>(null);
  const [creatingInStatus, setCreatingInStatus] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const { fire } = useConfetti();
  const router = useRouter();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const taskById = useMemo(() => {
    const map = new Map<string, TaskRow>();
    for (const s of statuses) for (const t of s.tasks) map.set(t.id, t);
    return map;
  }, [statuses]);

  const allColumnIds = statuses.map((s) => s.id);

  function findContainer(id: string): string | undefined {
    if (allColumnIds.includes(id)) return id;
    return statuses.find((s) => s.tasks.some((t) => t.id === id))?.id;
  }

  function handleDragStart(e: DragStartEvent) {
    setActiveId(String(e.active.id));
  }

  async function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    setActiveId(null);
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);
    const fromCol = findContainer(activeId);
    const toCol = findContainer(overId);
    if (!fromCol || !toCol) return;

    // Compute target index in destination column.
    const destStatus = statuses.find((s) => s.id === toCol)!;
    let targetIndex: number;
    if (overId === toCol) {
      targetIndex = destStatus.tasks.length;
    } else {
      const idx = destStatus.tasks.findIndex((t) => t.id === overId);
      targetIndex = idx === -1 ? destStatus.tasks.length : idx;
    }

    // Optimistic update
    setStatuses((prev) => {
      const next = prev.map((s) => ({ ...s, tasks: [...s.tasks] }));
      const srcCol = next.find((s) => s.id === fromCol)!;
      const dstCol = next.find((s) => s.id === toCol)!;
      const fromIdx = srcCol.tasks.findIndex((t) => t.id === activeId);
      if (fromIdx === -1) return prev;
      const [moved] = srcCol.tasks.splice(fromIdx, 1);
      moved.statusId = toCol;
      // targetIndex was computed from destStatus.tasks which still contained
      // the source task in the same-column case. After splicing the source
      // out, that index points to the correct insertion slot directly.
      const insertAt = Math.min(targetIndex, dstCol.tasks.length);
      dstCol.tasks.splice(insertAt, 0, moved);
      return next;
    });

    startTransition(async () => {
      try {
        const result = await moveTaskAction({
          id: activeId,
          targetStatusId: toCol,
          targetIndex,
        });
        if (result.celebrate) {
          fire(result.statusKind === "DONE" ? "done" : "cancelled");
        }
        router.refresh();
      } catch (err) {
        console.error(err);
        router.refresh();
      }
    });
  }

  const activeTask = activeId ? taskById.get(activeId) : null;

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {statuses.map((s) => (
            <Column
              key={s.id}
              id={s.id}
              name={s.name}
              color={s.color}
              kind={s.kind}
              count={s.tasks.length}
              onAdd={() => setCreatingInStatus(s.id)}
            >
              <SortableContext items={s.tasks.map((t) => t.id)}>
                {s.tasks.map((t) => (
                  <TaskCard key={t.id} task={t} onEdit={() => setEditingTask(t)} />
                ))}
              </SortableContext>
              {s.tasks.length === 0 && (
                <button
                  className="btn-ghost w-full justify-start text-xs text-muted-foreground"
                  onClick={() => setCreatingInStatus(s.id)}
                >
                  <Plus size={14} /> Add a task
                </button>
              )}
            </Column>
          ))}
        </div>
        <DragOverlay>
          {activeTask ? <TaskCardPresentational task={activeTask} dragging /> : null}
        </DragOverlay>
      </DndContext>

      {editingTask && (
        <TaskDialog
          mode="edit"
          task={editingTask}
          statuses={statuses.map((s) => ({ id: s.id, name: s.name }))}
          onClose={() => setEditingTask(null)}
        />
      )}
      {creatingInStatus && (
        <TaskDialog
          mode="create"
          statusId={creatingInStatus}
          statuses={statuses.map((s) => ({ id: s.id, name: s.name }))}
          onClose={() => setCreatingInStatus(null)}
        />
      )}
    </>
  );
}
