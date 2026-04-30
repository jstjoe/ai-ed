import type { Priority, TimeEstimate } from '../../types';
import { PRIORITY_COLORS, PRIORITY_LABELS, TIME_ESTIMATE_LABELS } from '../../types';
import { Clock } from 'lucide-react';

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${PRIORITY_COLORS[priority]}`}>
      {PRIORITY_LABELS[priority]}
    </span>
  );
}

export function TimeBadge({ estimate }: { estimate: TimeEstimate }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-gray-800 text-gray-300">
      <Clock size={11} />
      {TIME_ESTIMATE_LABELS[estimate]}
    </span>
  );
}
