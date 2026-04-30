import type { TimeBucket } from '../../types';
import { TIME_BUCKET_LABELS } from '../../types';

const BUCKETS: TimeBucket[] = ['5m', '15m', '30m', '1h', '2-3h', '3+h'];

interface Props {
  selected: TimeBucket | null;
  onChange: (b: TimeBucket) => void;
}

export function TimeFilter({ selected, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      <span className="text-sm text-gray-400 self-center mr-1">I have:</span>
      {BUCKETS.map((b) => (
        <button
          key={b}
          onClick={() => onChange(b)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selected === b
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-gray-100'
          }`}
        >
          {TIME_BUCKET_LABELS[b]}
        </button>
      ))}
    </div>
  );
}
