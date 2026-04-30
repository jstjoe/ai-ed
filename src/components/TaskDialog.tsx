import { useEffect, useState } from 'react';
import type { Priority, Status, Task } from '../data/types';
import { ESTIMATE_PRESETS } from '../lib/time';
import { useStore } from '../store/useStore';

interface Props {
  open: boolean;
  onClose: () => void;
  initial?: Task | null;
  defaultStatusId?: string;
}

interface FormState {
  title: string;
  description: string;
  priority: Priority;
  estimateMinutes: number | null;
  estimateUnknown: boolean;
  customEstimate: string;
  dueDate: string;
  tagsText: string;
  statusId: string;
}

const DEFAULT_FORM = (statuses: Status[], defaultStatusId?: string): FormState => ({
  title: '',
  description: '',
  priority: 'med',
  estimateMinutes: 30,
  estimateUnknown: false,
  customEstimate: '',
  dueDate: '',
  tagsText: '',
  statusId: defaultStatusId ?? statuses[0]?.id ?? '',
});

export default function TaskDialog({ open, onClose, initial, defaultStatusId }: Props) {
  const statuses = useStore((s) => s.statuses);
  const createTask = useStore((s) => s.createTask);
  const updateTask = useStore((s) => s.updateTask);
  const deleteTask = useStore((s) => s.deleteTask);

  const [form, setForm] = useState<FormState>(() => DEFAULT_FORM(statuses, defaultStatusId));

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setForm({
        title: initial.title,
        description: initial.description,
        priority: initial.priority,
        estimateMinutes: initial.estimateMinutes,
        estimateUnknown: initial.estimateMinutes === null,
        customEstimate:
          initial.estimateMinutes !== null &&
          !ESTIMATE_PRESETS.some((p) => p.minutes === initial.estimateMinutes)
            ? String(initial.estimateMinutes)
            : '',
        dueDate: initial.dueDate ?? '',
        tagsText: initial.tags.join(', '),
        statusId: initial.statusId,
      });
    } else {
      setForm(DEFAULT_FORM(statuses, defaultStatusId));
    }
  }, [open, initial, defaultStatusId, statuses]);

  if (!open) return null;

  const isEdit = !!initial;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    const estimateMinutes = form.estimateUnknown
      ? null
      : form.customEstimate.trim()
        ? Math.max(1, Math.round(Number(form.customEstimate)))
        : form.estimateMinutes;

    const tags = form.tagsText
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    if (isEdit && initial) {
      await updateTask(initial.id, {
        title: form.title.trim(),
        description: form.description,
        priority: form.priority,
        estimateMinutes,
        dueDate: form.dueDate || null,
        tags,
        statusId: form.statusId,
      });
    } else {
      await createTask({
        title: form.title.trim(),
        description: form.description,
        priority: form.priority,
        estimateMinutes,
        dueDate: form.dueDate || null,
        tags,
        statusId: form.statusId,
      });
    }
    onClose();
  };

  const onDelete = async () => {
    if (!initial) return;
    if (!confirm(`Delete task "${initial.title}"?`)) return;
    await deleteTask(initial.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/40 p-4 overflow-auto">
      <form
        onSubmit={submit}
        className="w-full max-w-lg rounded-lg bg-white shadow-xl"
      >
        <div className="border-b border-slate-200 px-5 py-3 text-base font-semibold">
          {isEdit ? 'Edit task' : 'New task'}
        </div>
        <div className="space-y-4 px-5 py-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Title</label>
            <input
              autoFocus
              className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="What needs doing?"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
            <textarea
              className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm h-24"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Markdown supported"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
              <select
                className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                value={form.statusId}
                onChange={(e) => setForm({ ...form, statusId: e.target.value })}
              >
                {statuses.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Priority</label>
              <select
                className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value as Priority })}
              >
                <option value="low">Low</option>
                <option value="med">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Time estimate <span className="text-slate-400">(required)</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {ESTIMATE_PRESETS.map((p) => {
                const selected =
                  (p.minutes === null && form.estimateUnknown) ||
                  (!form.estimateUnknown && form.estimateMinutes === p.minutes && !form.customEstimate);
                return (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() =>
                      setForm({
                        ...form,
                        estimateMinutes: p.minutes,
                        estimateUnknown: p.minutes === null,
                        customEstimate: '',
                      })
                    }
                    className={
                      'rounded-md border px-2.5 py-1 text-xs ' +
                      (selected
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50')
                    }
                  >
                    {p.label}
                  </button>
                );
              })}
              <input
                type="number"
                min={1}
                placeholder="custom min"
                className="w-24 rounded-md border border-slate-300 px-2 py-1 text-xs"
                value={form.customEstimate}
                onChange={(e) =>
                  setForm({
                    ...form,
                    customEstimate: e.target.value,
                    estimateUnknown: false,
                  })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Due date</label>
              <input
                type="date"
                className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Tags</label>
              <input
                className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                value={form.tagsText}
                onChange={(e) => setForm({ ...form, tagsText: e.target.value })}
                placeholder="comma, separated"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 px-5 py-3">
          <div>
            {isEdit && (
              <button
                type="button"
                onClick={onDelete}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Delete
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
              disabled={!form.title.trim()}
            >
              {isEdit ? 'Save' : 'Create'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
