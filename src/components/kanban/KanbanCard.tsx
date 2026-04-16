import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from '@/types/task';
import type { StatusConfig } from '@/types/settings';
import { DURATION_LABELS } from '@/types/task';
import { Badge } from '@/components/ui/Badge';

interface KanbanCardProps {
  task: Task;
  status: StatusConfig;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  isDragOverlay?: boolean;
}

const priorityColors: Record<string, string> = {
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#64748b',
};

export function KanbanCard({ task, status, onEdit, onDelete, isDragOverlay }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `card-${task.id}`,
    data: { type: 'card', task },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={isDragOverlay ? {} : style}
      className={`bg-slate-800 border border-slate-700 rounded-lg p-3 flex flex-col gap-2 group ${
        isDragOverlay ? 'shadow-2xl rotate-1 border-indigo-500' : 'hover:border-slate-500'
      } ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
    >
      <div className="flex items-start justify-between gap-2">
        <p
          className="text-sm text-slate-100 font-medium leading-snug flex-1 cursor-pointer hover:text-indigo-300 transition-colors"
          onClick={() => onEdit(task)}
        >
          {task.title}
        </p>
        <div
          {...attributes}
          {...listeners}
          className="text-slate-500 hover:text-slate-300 flex-shrink-0 mt-0.5 text-base"
          title="Drag to move"
        >
          ⠿
        </div>
      </div>

      {task.description && (
        <p className="text-xs text-slate-400 line-clamp-2">{task.description}</p>
      )}

      <div className="flex items-center gap-1.5 flex-wrap mt-1">
        <Badge color={status.color} className="text-xs">
          {DURATION_LABELS[task.duration]}
        </Badge>
        {task.priority && (
          <Badge color={priorityColors[task.priority]}>
            {task.priority}
          </Badge>
        )}
        <button
          onClick={() => onDelete(task.id)}
          className="ml-auto text-slate-600 hover:text-red-400 transition-colors text-xs opacity-0 group-hover:opacity-100 cursor-pointer"
          title="Delete task"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
