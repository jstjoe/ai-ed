export type TimeSlotId = '5m' | '15m' | '30m' | '60m' | '2-3h' | '3+h';

export interface TimeSlot {
  id: TimeSlotId;
  label: string;
  maxMinutes: number;
}

export const TIME_SLOTS: TimeSlot[] = [
  { id: '5m',   label: '5 min',     maxMinutes: 5 },
  { id: '15m',  label: '15 min',    maxMinutes: 15 },
  { id: '30m',  label: '30 min',    maxMinutes: 30 },
  { id: '60m',  label: '1 hour',    maxMinutes: 60 },
  { id: '2-3h', label: '2–3 hours', maxMinutes: 180 },
  { id: '3+h',  label: '3+ hours',  maxMinutes: Number.POSITIVE_INFINITY },
];

export function formatEstimate(minutes: number | null): string {
  if (minutes === null) return 'unknown';
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

export const ESTIMATE_PRESETS: Array<{ label: string; minutes: number | null }> = [
  { label: '5m', minutes: 5 },
  { label: '15m', minutes: 15 },
  { label: '30m', minutes: 30 },
  { label: '1h', minutes: 60 },
  { label: '2h', minutes: 120 },
  { label: '4h', minutes: 240 },
  { label: 'Unknown', minutes: null },
];
