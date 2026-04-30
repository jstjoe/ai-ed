import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Pencil, Trash2, GripVertical } from 'lucide-react';
import type { Task } from '../../types';
import { PriorityBadge, TimeBadge } from '../tasks/TaskBadges';

interface Props {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export function KanbanCard({ task, onEdit, onDelete }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `task-${task.id}`,
    data: { type: 'task', task },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && new Date(task.due_date).toDateString() !== new Date().toDateString();

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-gray-800 border border-gray-700 rounded-lg p-3 group cursor-default select-none hover:border-gray-500 transition-colors"
    >
      <div className="flex items-start gap-2">
        <button
          {...attributes}
          {...listeners}
          className="mt-0.5 text-gray-600 hover:text-gray-400 cursor-grab active:cursor-grabbing shrink-0 touch-none"
        >
          <GripVertical size={14} />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-100 font-medium leading-snug break-words">{task.title}</p>
          {task.description && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{task.description}</p>
          )}
          <div className="flex flex-wrap gap-1.5 mt-2">
            <PriorityBadge priority={task.priority} />
            <TimeBadge estimate={task.time_estimate} />
            {task.due_date && (
              <span className={`text-xs px-2 py-0.5 rounded font-medium ${isOverdue ? 'bg-red-900 text-red-300' : 'bg-gray-700 text-gray-400'}`}>
                {isOverdue ? '⚠ ' : ''}{task.due_date}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={() => onEdit(task)}
            className="text-gray-500 hover:text-blue-400 transition-colors p-1 rounded hover:bg-gray-700"
          >
            <Pencil size={12} />
          </button>
          <button
            onClick={() => onDelete(task)}
            className="text-gray-500 hover:text-red-400 transition-colors p-1 rounded hover:bg-gray-700"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}
