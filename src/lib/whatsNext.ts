import { differenceInCalendarDays, parseISO } from 'date-fns';
import type { Status, Task } from '../data/types';
import type { TimeSlot } from './time';

export interface RankedTask {
  task: Task;
  score: number;
  reasons: string[];
}

export function rankWhatsNext(
  tasks: Task[],
  statuses: Status[],
  slot: TimeSlot,
  now: Date = new Date()
): RankedTask[] {
  const statusById = new Map(statuses.map((s) => [s.id, s]));
  const inProgressIds = new Set(
    statuses
      .filter((s) => s.terminalKind === null && /in[\s-]?progress/i.test(s.name))
      .map((s) => s.id)
  );

  const eligible = tasks.filter((t) => {
    const status = statusById.get(t.statusId);
    if (!status) return false;
    if (status.terminalKind !== null) return false;
    if (t.estimateMinutes === null) return true;
    return t.estimateMinutes <= slot.maxMinutes;
  });

  const ranked: RankedTask[] = eligible.map((task) => {
    let score = 0;
    const reasons: string[] = [];

    if (task.dueDate) {
      const days = differenceInCalendarDays(parseISO(task.dueDate), now);
      if (days < 0) {
        score += 100;
        reasons.push(`overdue by ${Math.abs(days)}d`);
      } else if (days <= 3) {
        score += 30;
        reasons.push(days === 0 ? 'due today' : `due in ${days}d`);
      }
    }

    if (task.priority === 'high') { score += 30; reasons.push('high priority'); }
    else if (task.priority === 'med') { score += 15; }

    if (inProgressIds.has(task.statusId)) {
      score += 10;
      reasons.push('in progress');
    }

    if (task.estimateMinutes === null) reasons.push('estimate unknown');

    return { task, score, reasons };
  });

  ranked.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    const ad = a.task.dueDate ? parseISO(a.task.dueDate).getTime() : Number.POSITIVE_INFINITY;
    const bd = b.task.dueDate ? parseISO(b.task.dueDate).getTime() : Number.POSITIVE_INFINITY;
    if (ad !== bd) return ad - bd;
    return a.task.createdAt.localeCompare(b.task.createdAt);
  });

  return ranked;
}
