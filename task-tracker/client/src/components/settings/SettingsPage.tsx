import { Settings } from 'lucide-react';
import type { Status } from '../../types';
import { StatusEditor } from './StatusEditor';

interface Props {
  statuses: Status[];
  onRefetch: () => void;
}

export function SettingsPage({ statuses, onRefetch }: Props) {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="flex items-center gap-3 mb-2">
          <Settings size={22} className="text-gray-400" />
          <h1 className="text-2xl font-bold text-gray-100">Settings</h1>
        </div>
        <p className="text-gray-500 mb-8">Customize your workflow.</p>

        <section>
          <h2 className="text-base font-semibold text-gray-200 mb-1">Kanban Statuses</h2>
          <p className="text-sm text-gray-500 mb-4">
            Drag to reorder. Check "Done 🎉" or "Cancel 🎉" to trigger confetti when a task moves there.
          </p>
          <StatusEditor statuses={statuses} onRefetch={onRefetch} />
        </section>
      </div>
    </div>
  );
}
