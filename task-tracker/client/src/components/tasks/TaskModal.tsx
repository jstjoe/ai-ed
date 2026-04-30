import { useState } from 'react';
import { Modal } from '../layout/Modal';
import { api } from '../../api';
import type { Task, Status, TimeEstimate, Priority } from '../../types';
import { TIME_ESTIMATE_LABELS, PRIORITY_LABELS } from '../../types';

interface Props {
  task?: Task;
  statuses: Status[];
  defaultStatusId?: number;
  onClose: () => void;
  onSaved: () => void;
}

const TIME_ESTIMATES: TimeEstimate[] = ['5m', '15m', '30m', '1h', '2h', '3h+', 'unknown'];
const PRIORITIES: Priority[] = ['low', 'medium', 'high', 'urgent'];

export function TaskModal({ task, statuses, defaultStatusId, onClose, onSaved }: Props) {
  const isEdit = !!task;
  const firstStatusId = statuses[0]?.id;

  const [title, setTitle] = useState(task?.title ?? '');
  const [description, setDescription] = useState(task?.description ?? '');
  const [statusId, setStatusId] = useState<number>(task?.status_id ?? defaultStatusId ?? firstStatusId);
  const [timeEstimate, setTimeEstimate] = useState<TimeEstimate>(task?.time_estimate ?? 'unknown');
  const [priority, setPriority] = useState<Priority>(task?.priority ?? 'medium');
  const [dueDate, setDueDate] = useState(task?.due_date ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { setError('Title is required'); return; }

    setSaving(true);
    setError(null);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || undefined,
        status_id: statusId,
        time_estimate: timeEstimate,
        priority,
        due_date: dueDate || undefined,
      };
      if (isEdit) {
        await api.tasks.update(task.id, payload);
      } else {
        await api.tasks.create(payload as Parameters<typeof api.tasks.create>[0]);
      }
      onSaved();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={isEdit ? 'Edit Task' : 'New Task'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <p className="text-red-400 text-sm bg-red-900/20 border border-red-800 rounded-lg px-3 py-2">{error}</p>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Title *</label>
          <input
            autoFocus
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs to be done?"
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add more details..."
            rows={3}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Status *</label>
            <select
              value={statusId}
              onChange={(e) => setStatusId(Number(e.target.value))}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-blue-500 transition-colors"
            >
              {statuses.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Time Estimate *</label>
            <select
              value={timeEstimate}
              onChange={(e) => setTimeEstimate(e.target.value as TimeEstimate)}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-blue-500 transition-colors"
            >
              {TIME_ESTIMATES.map((t) => (
                <option key={t} value={t}>{TIME_ESTIMATE_LABELS[t]}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-blue-500 transition-colors"
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Task'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-400 hover:text-gray-100 hover:bg-gray-800 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}
