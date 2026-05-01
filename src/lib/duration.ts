export const DURATIONS = [
  "FIVE_MIN",
  "FIFTEEN_MIN",
  "THIRTY_MIN",
  "SIXTY_MIN",
  "TWO_THREE_HR",
  "THREE_PLUS_HR",
  "UNKNOWN",
] as const;

export type Duration = (typeof DURATIONS)[number];

export const DURATION_MINUTES: Record<Duration, number> = {
  FIVE_MIN: 5,
  FIFTEEN_MIN: 15,
  THIRTY_MIN: 30,
  SIXTY_MIN: 60,
  TWO_THREE_HR: 180,
  THREE_PLUS_HR: 360,
  UNKNOWN: -1,
};

export const DURATION_LABELS: Record<Duration, string> = {
  FIVE_MIN: "5 minutes",
  FIFTEEN_MIN: "15 minutes",
  THIRTY_MIN: "30 minutes",
  SIXTY_MIN: "60 minutes",
  TWO_THREE_HR: "2–3 hours",
  THREE_PLUS_HR: "3+ hours",
  UNKNOWN: "Unknown",
};

export const TIME_SLOTS = [
  { duration: "FIVE_MIN" as Duration, minutes: 5, label: "5m" },
  { duration: "FIFTEEN_MIN" as Duration, minutes: 15, label: "15m" },
  { duration: "THIRTY_MIN" as Duration, minutes: 30, label: "30m" },
  { duration: "SIXTY_MIN" as Duration, minutes: 60, label: "60m" },
  { duration: "TWO_THREE_HR" as Duration, minutes: 180, label: "2–3h" },
  { duration: "THREE_PLUS_HR" as Duration, minutes: 360, label: "3+h" },
];

export function isDuration(v: unknown): v is Duration {
  return typeof v === "string" && (DURATIONS as readonly string[]).includes(v);
}

export const PRIORITIES = ["LOW", "MEDIUM", "HIGH"] as const;
export type Priority = (typeof PRIORITIES)[number];

export const PRIORITY_LABELS: Record<Priority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
};

export const STATUS_KINDS = ["ACTIVE", "DONE", "CANCELLED"] as const;
export type StatusKind = (typeof STATUS_KINDS)[number];
