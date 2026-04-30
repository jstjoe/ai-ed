import clsx from 'clsx';
import { differenceInCalendarDays, parseISO } from 'date-fns';
import type { Task } from '../data/types';
import { formatEstimate } from '../lib/time';

interface Props {
  task: Task;
  onClick?: () => void;
  dragHandleProps?: Record<string, unknown>;
  className?: string;
  draggingProps?: Record<string, unknown>;
}

const PRIORITY_DOT: Record<Task['priority'], string> = {
  low: 'bg-slate-300',
  med: 'bg-amber-400',
  high: 'bg-red-500',
};

function dueLabel(due: string | null): { text: string; className: string } | null {
  if (!due) return null;
  const days = differenceInCalendarDays(parseISO(due), new Date());
  if (days < 0) return { text: `${Math.abs(days)}d overdue`, className: 'text-red-600' };
  if (days === 0) return { text: 'due today', className: 'text-amber-600' };
  if (days <= 3) return { text: `due in ${days}d`, className: 'text-amber-700' };
  return { text: due, className: 'text-slate-500' };
}

export default function TaskCard({ task, onClick, dragHandleProps, className, draggingProps }: Props) {
  const due = dueLabel(task.dueDate);

  return (
    <div
      {...draggingProps}
      onClick={onClick}
      className={clsx(
        'rounded-md bg-white border border-slate-200 px-3 py-2 shadow-sm cursor-pointer hover:border-slate-300 hover:shadow',
        className
      )}
    >
      <div className="flex items-start gap-2">
        <span
          className={clsx('mt-1 h-2 w-2 flex-shrink-0 rounded-full', PRIORITY_DOT[task.priority])}
          title={`${task.priority} priority`}
        />
        <div
          {...dragHandleProps}
          className="flex-1 text-sm font-medium text-slate-900 leading-snug"
        >
          {task.title}
        </div>
      </div>
      <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-500">
        <span className="rounded bg-slate-100 px-1.5 py-0.5 font-medium text-slate-700">
          {formatEstimate(task.estimateMinutes)}
        </span>
        {due && <span className={due.className}>{due.text}</span>}
        {task.tags.map((t) => (
          <span key={t} className="rounded bg-slate-100 px-1.5 py-0.5">#{t}</span>
        ))}
      </div>
    </div>
  );
}
