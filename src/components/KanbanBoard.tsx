import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  type DragOverEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useMemo, useState } from 'react';
import type { Status, Task } from '../data/types';
import { useStore } from '../store/useStore';
import TaskCard from './TaskCard';
import TaskDialog from './TaskDialog';

interface SortableTaskProps {
  task: Task;
  onEdit: () => void;
}

function SortableTask({ task, onEdit }: SortableTaskProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { type: 'task', task },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <TaskCard
        task={task}
        onClick={onEdit}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}

interface ColumnProps {
  status: Status;
  tasks: Task[];
  onEdit: (t: Task) => void;
  onAdd: () => void;
}

function Column({ status, tasks, onEdit, onAdd }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `col-${status.id}`,
    data: { type: 'column', statusId: status.id },
  });

  return (
    <div className="flex w-72 flex-shrink-0 flex-col rounded-lg bg-slate-100">
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: status.color }}
          />
          <span className="text-sm font-semibold text-slate-800">{status.name}</span>
          <span className="text-xs text-slate-500">{tasks.length}</span>
        </div>
        <button
          onClick={onAdd}
          className="text-slate-500 hover:text-slate-900 text-lg leading-none px-1"
          title="Add task to this column"
        >
          +
        </button>
      </div>

      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className={
            'flex-1 min-h-[120px] space-y-2 p-2 ' +
            (isOver ? 'bg-slate-200/60' : '')
          }
        >
          {tasks.map((t) => (
            <SortableTask key={t.id} task={t} onEdit={() => onEdit(t)} />
          ))}
          {tasks.length === 0 && (
            <div className="text-center text-xs text-slate-400 py-6">
              Drop tasks here
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}

export default function KanbanBoard() {
  const tasks = useStore((s) => s.tasks);
  const statuses = useStore((s) => s.statuses);
  const moveTask = useStore((s) => s.moveTask);
  const reorderTasksInStatus = useStore((s) => s.reorderTasksInStatus);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Task | null>(null);
  const [creatingInStatus, setCreatingInStatus] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  );

  const tasksByStatus = useMemo(() => {
    const map = new Map<string, Task[]>();
    statuses.forEach((s) => map.set(s.id, []));
    [...tasks]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .forEach((t) => {
        const list = map.get(t.statusId);
        if (list) list.push(t);
      });
    return map;
  }, [tasks, statuses]);

  const activeTask = activeId ? tasks.find((t) => t.id === activeId) ?? null : null;

  const findContainer = (id: string): string | null => {
    if (id.startsWith('col-')) return id.slice(4);
    const t = tasks.find((x) => x.id === id);
    return t ? t.statusId : null;
  };

  const onDragStart = (e: DragStartEvent) => {
    setActiveId(String(e.active.id));
  };

  const onDragOver = (_e: DragOverEvent) => {
    // Optimistic cross-column visual is handled by isOver; the actual
    // persistence happens in onDragEnd to keep the operation atomic.
  };

  const onDragEnd = async (e: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = e;
    if (!over) return;

    const activeIdStr = String(active.id);
    const overIdStr = String(over.id);

    const fromStatusId = findContainer(activeIdStr);
    const toStatusId = findContainer(overIdStr);
    if (!fromStatusId || !toStatusId) return;

    if (fromStatusId === toStatusId) {
      const list = tasksByStatus.get(fromStatusId) ?? [];
      const oldIdx = list.findIndex((t) => t.id === activeIdStr);
      const newIdx = overIdStr.startsWith('col-')
        ? list.length - 1
        : list.findIndex((t) => t.id === overIdStr);
      if (oldIdx === -1 || newIdx === -1 || oldIdx === newIdx) return;
      const reordered = arrayMove(list, oldIdx, newIdx);
      await reorderTasksInStatus(fromStatusId, reordered.map((t) => t.id));
      return;
    }

    const toList = tasksByStatus.get(toStatusId) ?? [];
    let insertAt = toList.length;
    if (!overIdStr.startsWith('col-')) {
      const overIdx = toList.findIndex((t) => t.id === overIdStr);
      if (overIdx >= 0) insertAt = overIdx;
    }
    await moveTask(activeIdStr, toStatusId, insertAt);
    const newList = [...toList];
    newList.splice(insertAt, 0, { ...tasks.find((t) => t.id === activeIdStr)!, statusId: toStatusId });
    await reorderTasksInStatus(toStatusId, newList.map((t) => t.id));
  };

  if (statuses.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500">
        No statuses yet. Add one in Settings.
      </div>
    );
  }

  return (
    <div className="h-full">
      <DndContext
        sensors={sensors}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
      >
        <div className="flex gap-3 overflow-x-auto p-4 h-full">
          {statuses.map((s) => (
            <Column
              key={s.id}
              status={s}
              tasks={tasksByStatus.get(s.id) ?? []}
              onEdit={(t) => setEditing(t)}
              onAdd={() => setCreatingInStatus(s.id)}
            />
          ))}
        </div>
        <DragOverlay>
          {activeTask ? <TaskCard task={activeTask} className="shadow-lg" /> : null}
        </DragOverlay>
      </DndContext>

      <TaskDialog
        open={!!editing}
        initial={editing}
        onClose={() => setEditing(null)}
      />
      <TaskDialog
        open={!!creatingInStatus}
        defaultStatusId={creatingInStatus ?? undefined}
        onClose={() => setCreatingInStatus(null)}
      />
    </div>
  );
}
