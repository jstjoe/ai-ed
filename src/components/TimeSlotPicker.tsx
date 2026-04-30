import clsx from 'clsx';
import { TIME_SLOTS, type TimeSlotId } from '../lib/time';

interface Props {
  value: TimeSlotId;
  onChange: (id: TimeSlotId) => void;
}

export default function TimeSlotPicker({ value, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {TIME_SLOTS.map((slot) => (
        <button
          key={slot.id}
          onClick={() => onChange(slot.id)}
          className={clsx(
            'rounded-md border px-3 py-1.5 text-sm font-medium transition-colors',
            value === slot.id
              ? 'border-slate-900 bg-slate-900 text-white'
              : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
          )}
        >
          {slot.label}
        </button>
      ))}
    </div>
  );
}
