import { useState } from 'react';
import { Input, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { DurationSelect } from './DurationSelect';
import type { Task, Duration, Priority } from '@/types/task';
import type { StatusConfig } from '@/types/settings';
import { generateId } from '@/utils/idgen';

interface TaskFormProps {
  initialValues?: Partial<Task>;
  statuses: StatusConfig[];
  defaultStatusId: string;
  onSave: (task: Task) => void;
  onCancel: () => void;
}

export function TaskForm({ initialValues, statuses, defaultStatusId, onSave, onCancel }: TaskFormProps) {
  const [title, setTitle] = useState(initialValues?.title ?? '');
  const [description, setDescription] = useState(initialValues?.description ?? '');
  const [statusId, setStatusId] = useState(initialValues?.statusId ?? defaultStatusId);
  const [duration, setDuration] = useState<Duration | ''>(initialValues?.duration ?? '');
  const [priority, setPriority] = useState<Priority | ''>(initialValues?.priority ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = 'Title is required';
    if (!duration) e.duration = 'Duration is required';
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    const now = new Date().toISOString();
    const task: Task = {
      id: initialValues?.id ?? generateId(),
      title: title.trim(),
      description: description.trim() || undefined,
      statusId,
      duration: duration as Duration,
      priority: priority as Priority || undefined,
      createdAt: initialValues?.createdAt ?? now,
      updatedAt: now,
      completedAt: initialValues?.completedAt,
      sortOrder: initialValues?.sortOrder ?? Date.now(),
    };
    onSave(task);
  };

  const activeStatuses = [...statuses].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Title *"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="What needs to be done?"
        error={errors.title}
        autoFocus
        maxLength={200}
      />

      <Textarea
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Optional details…"
        rows={3}
      />

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">Status</label>
          <select
            value={statusId}
            onChange={(e) => setStatusId(e.target.value)}
            className="bg-slate-800 border border-slate-600 rounded-md px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            {activeStatuses.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority | '')}
            className="bg-slate-800 border border-slate-600 rounded-md px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="">None</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      <DurationSelect value={duration} onChange={setDuration} error={errors.duration} />

      <div className="flex justify-end gap-2 pt-2 border-t border-slate-700">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{initialValues?.id ? 'Save changes' : 'Add task'}</Button>
      </div>
    </form>
  );
}
