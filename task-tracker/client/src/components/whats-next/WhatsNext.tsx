import { useState } from 'react';
import { Zap, Plus } from 'lucide-react';
import type { TimeBucket, Status } from '../../types';
import { useTasks } from '../../hooks/useTasks';
import { TimeFilter } from './TimeFilter';
import { WhatsNextCard } from './TaskCard';
import { TaskModal } from '../tasks/TaskModal';

interface Props {
  statuses: Status[];
}

export function WhatsNext({ statuses }: Props) {
  const [selectedTime, setSelectedTime] = useState<TimeBucket | null>(null);
  const [editingTask, setEditingTask] = useState<Parameters<typeof import('../tasks/TaskModal').TaskModal>[0]['task']>(undefined);
  const [showAdd, setShowAdd] = useState(false);

  const { tasks, loading, refetch } = useTasks(selectedTime ?? undefined);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="flex items-center gap-3 mb-2">
          <Zap size={22} className="text-yellow-400" />
          <h1 className="text-2xl font-bold text-gray-100">What's Next?</h1>
        </div>
        <p className="text-gray-500 mb-8">Select how much time you have and see what you can tackle.</p>

        <div className="mb-8">
          <TimeFilter selected={selectedTime} onChange={setSelectedTime} />
        </div>

        {!selectedTime && (
          <div className="text-center py-16 text-gray-600">
            <Zap size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-lg">Pick a time block above to see suggested tasks</p>
          </div>
        )}

        {selectedTime && loading && (
          <div className="text-center py-12 text-gray-600">Loading tasks…</div>
        )}

        {selectedTime && !loading && tasks.length === 0 && (
          <div className="text-center py-16 text-gray-600">
            <p className="text-lg mb-2">No tasks fit this time block</p>
            <p className="text-sm">Try a longer time, or add a new task.</p>
          </div>
        )}

        {selectedTime && !loading && tasks.length > 0 && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm text-gray-400">
                {tasks.length} task{tasks.length !== 1 ? 's' : ''} available
              </p>
              <button
                onClick={() => setShowAdd(true)}
                className="flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                <Plus size={14} /> Add task
              </button>
            </div>
            {tasks.map((task) => (
              <WhatsNextCard
                key={task.id}
                task={task}
                statuses={statuses}
                onEdit={setEditingTask}
                onRefetch={refetch}
              />
            ))}
          </div>
        )}

        {selectedTime && !loading && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-300 text-sm transition-colors"
            >
              <Plus size={14} /> Add new task
            </button>
          </div>
        )}
      </div>

      {(editingTask || showAdd) && (
        <TaskModal
          task={editingTask}
          statuses={statuses}
          onClose={() => { setEditingTask(undefined); setShowAdd(false); }}
          onSaved={refetch}
        />
      )}
    </div>
  );
}
