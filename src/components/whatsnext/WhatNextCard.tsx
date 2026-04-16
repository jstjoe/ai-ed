import type { Task } from '@/types/task';
import type { StatusConfig } from '@/types/settings';
import { DURATION_LABELS } from '@/types/task';
import { Badge, StatusDot } from '@/components/ui/Badge';

interface WhatNextCardProps {
  task: Task;
  status: StatusConfig;
  rank: number;
  onEdit: (task: Task) => void;
}

const priorityColors: Record<string, string> = {
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#64748b',
};

export function WhatNextCard({ task, status, rank, onEdit }: WhatNextCardProps) {
  return (
    <div
      className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex gap-4 hover:border-slate-500 transition-colors cursor-pointer group"
      onClick={() => onEdit(task)}
    >
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold text-slate-400">
        {rank}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-100 group-hover:text-indigo-300 transition-colors">
          {task.title}
        </p>
        {task.description && (
          <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{task.description}</p>
        )}
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <StatusDot color={status.color} />
            <span className="text-xs text-slate-400">{status.name}</span>
          </div>
          <Badge color={status.color}>{DURATION_LABELS[task.duration]}</Badge>
          {task.priority && (
            <Badge color={priorityColors[task.priority]}>{task.priority}</Badge>
          )}
        </div>
      </div>
    </div>
  );
}
