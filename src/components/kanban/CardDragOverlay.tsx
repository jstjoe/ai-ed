import type { Task } from '@/types/task';
import type { StatusConfig } from '@/types/settings';
import { KanbanCard } from './KanbanCard';

interface CardDragOverlayProps {
  task: Task;
  status: StatusConfig;
}

export function CardDragOverlay({ task, status }: CardDragOverlayProps) {
  return (
    <KanbanCard
      task={task}
      status={status}
      onEdit={() => {}}
      onDelete={() => {}}
      isDragOverlay
    />
  );
}
