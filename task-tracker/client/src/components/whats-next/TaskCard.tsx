import { CheckCircle2, Pencil, Calendar } from 'lucide-react';
import type { Task, Status } from '../../types';
import { PriorityBadge, TimeBadge } from '../tasks/TaskBadges';
import { api } from '../../api';
import { fireConfetti } from '../kanban/confetti';

interface Props {
  task: Task;
  statuses: Status[];
  onEdit: (task: Task) => void;
  onRefetch: () => void;
}

export function WhatsNextCard({ task, statuses, onEdit, onRefetch }: Props) {
  const doneStatus = statuses.find((s) => s.is_done);
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && new Date(task.due_date).toDateString() !== new Date().toDateString();

  async function markDone() {
    if (!doneStatus) return;
    await api.tasks.update(task.id, { status_id: doneStatus.id });
    onRefetch();
    fireConfetti();
  }

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 hover:border-gray-500 transition-colors group">
      <div className="flex items-start gap-3">
        <button
          onClick={markDone}
          disabled={!doneStatus}
          className="mt-0.5 text-gray-600 hover:text-green-400 transition-colors shrink-0 disabled:opacity-30"
          title="Mark as done"
        >
          <CheckCircle2 size={20} />
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="font-medium text-gray-100 leading-snug">{task.title}</p>
            <button
              onClick={() => onEdit(task)}
              className="text-gray-600 hover:text-blue-400 transition-colors opacity-0 group-hover:opacity-100 shrink-0 p-1 rounded hover:bg-gray-800"
            >
              <Pencil size={14} />
            </button>
          </div>

          {task.description && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{task.description}</p>
          )}

          <div className="flex flex-wrap items-center gap-2 mt-3">
            <PriorityBadge priority={task.priority} />
            <TimeBadge estimate={task.time_estimate} />
            {task.status_name && (
              <span
                className="text-xs px-2 py-0.5 rounded font-medium"
                style={{
                  backgroundColor: (task.status_color ?? '#6b7280') + '33',
                  color: task.status_color ?? '#9ca3af',
                }}
              >
                {task.status_name}
              </span>
            )}
            {task.due_date && (
              <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded font-medium ${isOverdue ? 'bg-red-900 text-red-300' : 'bg-gray-800 text-gray-400'}`}>
                <Calendar size={10} />
                {isOverdue ? '⚠ ' : ''}{task.due_date}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
