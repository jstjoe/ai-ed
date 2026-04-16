import { useState } from 'react';
import { StatusList } from './StatusList';
import { StatusEditor } from './StatusEditor';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useSettingsStore } from '@/store/settingsStore';
import { useTaskStore } from '@/store/taskStore';
import type { StatusConfig } from '@/types/settings';
import { generateId } from '@/utils/idgen';

export function SettingsPage() {
  const { settings, addStatus, updateStatus, deleteStatus, reorderStatuses, setDefaultStatus } =
    useSettingsStore();
  const { tasks, updateTask } = useTaskStore();
  const [addingStatus, setAddingStatus] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);
  const [reassignTo, setReassignTo] = useState('');

  const sorted = [...settings.statuses].sort((a, b) => a.sortOrder - b.sortOrder);

  const handleAddStatus = (patch: Partial<StatusConfig>) => {
    const newStatus: StatusConfig = {
      id: generateId(),
      name: patch.name ?? 'New Status',
      color: patch.color ?? '#60a5fa',
      isTerminal: patch.isTerminal ?? false,
      isDone: patch.isDone ?? false,
      sortOrder: settings.statuses.length,
    };
    addStatus(newStatus);
    setAddingStatus(false);
  };

  const handleDeleteRequest = (id: string) => {
    const status = settings.statuses.find((s) => s.id === id);
    if (!status) return;
    const tasksUsing = tasks.filter((t) => t.statusId === id);
    if (tasksUsing.length > 0) {
      setReassignTo(sorted.find((s) => s.id !== id)?.id ?? '');
      setDeleteConfirm({ id, name: status.name });
    } else {
      if (confirm(`Delete status "${status.name}"?`)) deleteStatus(id);
    }
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirm) return;
    if (reassignTo) {
      tasks
        .filter((t) => t.statusId === deleteConfirm.id)
        .forEach((t) => updateTask(t.id, { statusId: reassignTo }));
    }
    deleteStatus(deleteConfirm.id);
    setDeleteConfirm(null);
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-100 mb-1">Settings</h1>
        <p className="text-slate-400 text-sm">Customize your workflow statuses and defaults.</p>
      </div>

      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-slate-200">Workflow Statuses</h2>
          <Button size="sm" variant="secondary" onClick={() => setAddingStatus(true)}>
            + Add status
          </Button>
        </div>

        <StatusList
          statuses={settings.statuses}
          tasks={tasks}
          onReorder={reorderStatuses}
          onUpdate={(id, patch) => updateStatus(id, patch)}
          onDelete={handleDeleteRequest}
        />

        {addingStatus && (
          <div className="mt-3">
            <StatusEditor
              status={{ id: '', name: '', color: '#60a5fa', isTerminal: false, isDone: false, sortOrder: 0 }}
              onSave={handleAddStatus}
              onCancel={() => setAddingStatus(false)}
            />
          </div>
        )}
      </section>

      <section>
        <h2 className="text-base font-semibold text-slate-200 mb-3">Default Status for New Tasks</h2>
        <select
          value={settings.defaultStatusId}
          onChange={(e) => setDefaultStatus(e.target.value)}
          className="bg-slate-800 border border-slate-600 rounded-md px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 cursor-pointer"
        >
          {sorted
            .filter((s) => !s.isTerminal)
            .map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
        </select>
      </section>

      <Modal
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title={`Delete "${deleteConfirm?.name}"?`}
        maxWidth="max-w-md"
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-slate-300">
            {tasks.filter((t) => t.statusId === deleteConfirm?.id).length} task(s) use this status.
            Move them to another status before deleting.
          </p>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">Move tasks to</label>
            <select
              value={reassignTo}
              onChange={(e) => setReassignTo(e.target.value)}
              className="bg-slate-800 border border-slate-600 rounded-md px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              {sorted.filter((s) => s.id !== deleteConfirm?.id).map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-700">
            <Button variant="ghost" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleConfirmDelete}>Delete & move tasks</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
