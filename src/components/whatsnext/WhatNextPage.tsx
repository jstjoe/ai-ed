import { useState } from 'react';
import { TimeSlotPicker } from './TimeSlotPicker';
import { WhatNextCard } from './WhatNextCard';
import { useWhatNext, type TimeSlot } from '@/hooks/useWhatNext';
import { useSettingsStore } from '@/store/settingsStore';
import { useTaskStore } from '@/store/taskStore';
import { TaskModal } from '@/components/task/TaskModal';
import type { Task } from '@/types/task';

export function WhatNextPage() {
  const [slot, setSlot] = useState<TimeSlot>('30m');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const ranked = useWhatNext(slot);
  const statuses = useSettingsStore((s) => s.settings.statuses);
  const { updateTask } = useTaskStore();

  const handleEdit = (task: Task) => setEditingTask(task);

  const handleSave = (task: Task) => {
    updateTask(task.id, { ...task });
    setEditingTask(null);
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-100 mb-1">What's Next?</h1>
        <p className="text-slate-400 text-sm">How much time do you have right now?</p>
      </div>

      <div className="mb-8">
        <TimeSlotPicker selected={slot} onChange={setSlot} />
      </div>

      {ranked.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <p className="text-4xl mb-3">✓</p>
          <p className="text-sm">No tasks fit this time slot — you're all caught up!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-1">
            {ranked.length} task{ranked.length !== 1 ? 's' : ''} you could start now
          </p>
          {ranked.map((task, i) => {
            const status = statuses.find((s) => s.id === task.statusId);
            if (!status) return null;
            return (
              <WhatNextCard
                key={task.id}
                task={task}
                status={status}
                rank={i + 1}
                onEdit={handleEdit}
              />
            );
          })}
        </div>
      )}

      {editingTask && (
        <TaskModal
          open
          onClose={() => setEditingTask(null)}
          initialValues={editingTask}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
