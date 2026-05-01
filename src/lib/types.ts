export type TimeBucketId =
  | "5m"
  | "15m"
  | "30m"
  | "60m"
  | "2-3h"
  | "3h+"
  | "unknown";

export interface TimeBucket {
  id: TimeBucketId;
  label: string;
  /** Approximate minutes for sorting / fitting. `null` means unknown. */
  minutes: number | null;
}

export const TIME_BUCKETS: TimeBucket[] = [
  { id: "5m", label: "5 min", minutes: 5 },
  { id: "15m", label: "15 min", minutes: 15 },
  { id: "30m", label: "30 min", minutes: 30 },
  { id: "60m", label: "1 hour", minutes: 60 },
  { id: "2-3h", label: "2-3 hours", minutes: 180 },
  { id: "3h+", label: "3+ hours", minutes: 240 },
  { id: "unknown", label: "Unknown", minutes: null },
];

export const TIME_BUCKET_BY_ID: Record<TimeBucketId, TimeBucket> = Object.fromEntries(
  TIME_BUCKETS.map((b) => [b.id, b]),
) as Record<TimeBucketId, TimeBucket>;

export type Priority = "low" | "medium" | "high";

export interface Status {
  id: string;
  name: string;
  color: string; // hex
  /** Marks tasks in this status as complete (triggers confetti, hidden from "what's next"). */
  isDone?: boolean;
  /** Marks tasks in this status as cancelled (triggers confetti, hidden from "what's next"). */
  isCancelled?: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  statusId: string;
  timeEstimate: TimeBucketId;
  priority: Priority;
  /** Position within the column for ordering. */
  order: number;
  createdAt: number;
  updatedAt: number;
  completedAt?: number;
}

export interface AppData {
  tasks: Task[];
  statuses: Status[];
  /** Schema version for future migrations. */
  version: number;
}

export const DEFAULT_STATUSES: Status[] = [
  { id: "backlog", name: "Backlog", color: "#94a3b8" },
  { id: "todo", name: "To Do", color: "#60a5fa" },
  { id: "in_progress", name: "In Progress", color: "#f59e0b" },
  { id: "review", name: "Review", color: "#a855f7" },
  { id: "done", name: "Done", color: "#22c55e", isDone: true },
  { id: "cancelled", name: "Cancelled", color: "#ef4444", isCancelled: true },
];

export const CURRENT_SCHEMA_VERSION = 1;
