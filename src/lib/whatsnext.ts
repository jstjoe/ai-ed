import {
  DURATION_MINUTES,
  type Duration,
  type Priority,
} from "./duration";

export type RankableTask = {
  id: string;
  title: string;
  duration: Duration;
  priority: Priority;
  dueDate: Date | null;
  statusKind: "ACTIVE" | "DONE" | "CANCELLED";
};

export type RankedTask = RankableTask & {
  score: number;
  reasons: string[];
};

export type RankInput = {
  tasks: RankableTask[];
  slotMinutes: number;
  now?: Date;
  limit?: number;
};

const PRIORITY_WEIGHT: Record<Priority, number> = {
  HIGH: 300,
  MEDIUM: 100,
  LOW: 0,
};

function daysUntil(due: Date, now: Date): number {
  const ms = due.getTime() - now.getTime();
  return ms / (1000 * 60 * 60 * 24);
}

export function rankTasks({
  tasks,
  slotMinutes,
  now = new Date(),
  limit = 5,
}: RankInput): RankedTask[] {
  const eligible = tasks.filter((t) => {
    if (t.statusKind !== "ACTIVE") return false;
    const mins = DURATION_MINUTES[t.duration];
    if (mins === -1) {
      // Unknown duration: only allow in slots >= 30 min
      return slotMinutes >= 30;
    }
    return mins <= slotMinutes;
  });

  const scored: RankedTask[] = eligible.map((t) => {
    const reasons: string[] = [];
    let score = 0;

    if (t.dueDate) {
      const d = daysUntil(t.dueDate, now);
      if (d < 0) {
        score += 1000;
        reasons.push("Overdue");
      } else {
        const boost = Math.max(0, Math.min(200, 200 - d * 20));
        if (boost > 0) {
          score += boost;
          if (d < 1) reasons.push("Due today");
          else if (d < 2) reasons.push("Due tomorrow");
          else reasons.push(`Due in ${Math.ceil(d)}d`);
        }
      }
    }

    score += PRIORITY_WEIGHT[t.priority];
    if (t.priority === "HIGH") reasons.push("High priority");

    const mins = DURATION_MINUTES[t.duration];
    if (mins === -1) {
      score -= 50;
      reasons.push("Unknown length");
    } else {
      const fit = mins / slotMinutes;
      const fitBonus = Math.round(100 * fit);
      score += fitBonus;
      if (fit >= 0.66) reasons.push("Fits your slot");
    }

    return { ...t, score, reasons };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit);
}
