import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { StatusRow } from './StatusRow';
import type { StatusConfig } from '@/types/settings';
import type { Task } from '@/types/task';

interface StatusListProps {
  statuses: StatusConfig[];
  tasks: Task[];
  onReorder: (ordered: StatusConfig[]) => void;
  onUpdate: (id: string, patch: Partial<StatusConfig>) => void;
  onDelete: (id: string) => void;
}

export function StatusList({ statuses, tasks, onReorder, onUpdate, onDelete }: StatusListProps) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const sorted = [...statuses].sort((a, b) => a.sortOrder - b.sortOrder);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = sorted.findIndex((s) => s.id === active.id);
    const newIndex = sorted.findIndex((s) => s.id === over.id);
    onReorder(arrayMove(sorted, oldIndex, newIndex));
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <SortableContext items={sorted.map((s) => s.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2">
          {sorted.map((status) => (
            <StatusRow
              key={status.id}
              status={status}
              taskCount={tasks.filter((t) => t.statusId === status.id).length}
              onUpdate={onUpdate}
              onDelete={onDelete}
              canDelete={statuses.length > 1}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
