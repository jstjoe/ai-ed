import { DURATIONS, DURATION_LABELS, type Duration } from '@/types/task';

interface DurationSelectProps {
  value: Duration | '';
  onChange: (value: Duration) => void;
  error?: string;
}

export function DurationSelect({ value, onChange, error }: DurationSelectProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">
        Duration <span className="text-red-400">*</span>
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as Duration)}
        className={`w-full bg-slate-800 border rounded-md px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors cursor-pointer ${
          error ? 'border-red-500' : 'border-slate-600 focus:border-indigo-500'
        }`}
      >
        <option value="" disabled>Select duration…</option>
        {DURATIONS.map((d) => (
          <option key={d} value={d}>{DURATION_LABELS[d]}</option>
        ))}
      </select>
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}
