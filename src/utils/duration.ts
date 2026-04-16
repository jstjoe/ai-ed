import { DURATION_MINUTES, type Duration } from '@/types/task';

export const TIME_SLOTS = ['5m', '15m', '30m', '60m', '2-3h', '3h+'] as const;
export type TimeSlot = typeof TIME_SLOTS[number];

export const SLOT_LABELS: Record<TimeSlot, string> = {
  '5m': '5 min',
  '15m': '15 min',
  '30m': '30 min',
  '60m': '1 hour',
  '2-3h': '2–3 hours',
  '3h+': '3+ hours',
};

const SLOT_MINUTES: Record<TimeSlot, number> = {
  '5m': 5,
  '15m': 15,
  '30m': 30,
  '60m': 60,
  '2-3h': 180,
  '3h+': Infinity,
};

export function durationFitsSlot(duration: Duration, slot: TimeSlot): boolean {
  if (duration === 'unknown') return true;
  if (slot === '3h+') return true;
  return DURATION_MINUTES[duration] <= SLOT_MINUTES[slot];
}
