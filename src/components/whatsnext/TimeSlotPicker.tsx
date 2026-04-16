import { TIME_SLOTS, SLOT_LABELS, type TimeSlot } from '@/utils/duration';

interface TimeSlotPickerProps {
  selected: TimeSlot;
  onChange: (slot: TimeSlot) => void;
}

export function TimeSlotPicker({ selected, onChange }: TimeSlotPickerProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {TIME_SLOTS.map((slot) => (
        <button
          key={slot}
          onClick={() => onChange(slot)}
          className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all cursor-pointer ${
            selected === slot
              ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20'
              : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500 hover:text-slate-100'
          }`}
        >
          {SLOT_LABELS[slot]}
        </button>
      ))}
    </div>
  );
}
