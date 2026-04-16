import { useState } from 'react';
import { Plus, Trash2, GripVertical, Save, CheckCircle, XCircle } from 'lucide-react';
import { Status } from '../types';
import { useStore } from '../store';

const PRESET_COLORS = [
  '#64748b', '#3b82f6', '#22c55e', '#f59e0b',
  '#8b5cf6', '#ec4899', '#ef4444', '#06b6d4',
  '#84cc16', '#f97316', '#14b8a6', '#a855f7',
];

export default function Settings() {
  const { state, updateStatuses, addStatus, updateStatus, deleteStatus } = useStore();
  const [statuses, setStatuses] = useState<Status[]>(
    [...state.settings.statuses].sort((a, b) => a.order - b.order)
  );
  const [saved, setSaved] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('#64748b');
  const [newTerminal, setNewTerminal] = useState(false);
  const [newTerminalType, setNewTerminalType] = useState<'done' | 'cancelled'>('done');
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);

  const handleSave = () => {
    const reordered = statuses.map((s, i) => ({ ...s, order: i }));
    updateStatuses(reordered);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleAdd = () => {
    if (!newName.trim()) return;
    const newStatus: Status = {
      id: crypto.randomUUID(),
      name: newName.trim(),
      color: newColor,
      order: statuses.length,
      isTerminal: newTerminal,
      terminalType: newTerminal ? newTerminalType : undefined,
    };
    const updated = [...statuses, newStatus];
    setStatuses(updated);
    updateStatuses(updated.map((s, i) => ({ ...s, order: i })));
    setNewName('');
    setNewTerminal(false);
  };

  const handleDelete = (id: string) => {
    if (statuses.length <= 1) return;
    const updated = statuses.filter(s => s.id !== id);
    setStatuses(updated);
    deleteStatus(id);
  };

  const handleUpdate = (id: string, field: keyof Status, value: string | boolean) => {
    setStatuses(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  // Simple drag-to-reorder via HTML5 drag API
  const handleDragStart = (id: string) => setDragging(id);
  const handleDragEnter = (id: string) => setDragOver(id);
  const handleDrop = (targetId: string) => {
    if (!dragging || dragging === targetId) { setDragging(null); setDragOver(null); return; }
    const from = statuses.findIndex(s => s.id === dragging);
    const to = statuses.findIndex(s => s.id === targetId);
    const updated = [...statuses];
    const [item] = updated.splice(from, 1);
    updated.splice(to, 0, item);
    setStatuses(updated);
    setDragging(null);
    setDragOver(null);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 max-w-2xl mx-auto w-full">
      <h2 className="text-lg font-bold text-slate-800 mb-1">Settings</h2>
      <p className="text-sm text-slate-500 mb-6">Customize your kanban statuses, colors, and order.</p>

      <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
        {statuses.map(status => (
          <div
            key={status.id}
            draggable
            onDragStart={() => handleDragStart(status.id)}
            onDragEnter={() => handleDragEnter(status.id)}
            onDragOver={e => e.preventDefault()}
            onDrop={() => handleDrop(status.id)}
            onDragEnd={() => { setDragging(null); setDragOver(null); }}
            className={`flex items-center gap-3 px-4 py-3 transition-colors ${
              dragOver === status.id ? 'bg-blue-50' : ''
            } ${dragging === status.id ? 'opacity-40' : ''}`}
          >
            <GripVertical size={16} className="text-slate-300 cursor-grab shrink-0" />

            <div
              className="w-4 h-4 rounded-full shrink-0 border-2 border-white shadow-sm"
              style={{ backgroundColor: status.color }}
            />

            <input
              value={status.name}
              onChange={e => handleUpdate(status.id, 'name', e.target.value)}
              className="flex-1 text-sm font-medium text-slate-700 border-0 bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-1 py-0.5"
            />

            <div className="flex items-center gap-1 shrink-0">
              {PRESET_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => handleUpdate(status.id, 'color', c)}
                  className={`w-4 h-4 rounded-full border-2 transition-transform hover:scale-110 ${
                    status.color === c ? 'border-slate-700 scale-110' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
              <input
                type="color"
                value={status.color}
                onChange={e => handleUpdate(status.id, 'color', e.target.value)}
                className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent p-0"
                title="Custom color"
              />
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <label className="flex items-center gap-1.5 text-xs text-slate-500 cursor-pointer">
                <input
                  type="checkbox"
                  checked={status.isTerminal}
                  onChange={e => handleUpdate(status.id, 'isTerminal', e.target.checked)}
                  className="rounded"
                />
                Terminal
              </label>
              {status.isTerminal && (
                <select
                  value={status.terminalType ?? 'done'}
                  onChange={e => handleUpdate(status.id, 'terminalType', e.target.value)}
                  className="text-xs border border-slate-200 rounded px-1 py-0.5"
                >
                  <option value="done">
                    Done
                  </option>
                  <option value="cancelled">Cancelled</option>
                </select>
              )}
            </div>

            <button
              onClick={() => handleDelete(status.id)}
              disabled={statuses.length <= 1}
              className="p-1 rounded hover:bg-red-50 text-slate-300 hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed"
              title="Delete status"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-4 bg-white rounded-xl border border-slate-200 p-4">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Add Status</p>
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-32">
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleAdd(); }}
              placeholder="Status name..."
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div className="flex items-center gap-1">
            {PRESET_COLORS.map(c => (
              <button
                key={c}
                onClick={() => setNewColor(c)}
                className={`w-5 h-5 rounded-full border-2 transition-transform hover:scale-110 ${
                  newColor === c ? 'border-slate-700 scale-110' : 'border-transparent'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
            <input
              type="color"
              value={newColor}
              onChange={e => setNewColor(e.target.value)}
              className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent p-0"
            />
          </div>
          <label className="flex items-center gap-1.5 text-sm text-slate-600 cursor-pointer">
            <input
              type="checkbox"
              checked={newTerminal}
              onChange={e => setNewTerminal(e.target.checked)}
              className="rounded"
            />
            Terminal
          </label>
          {newTerminal && (
            <select
              value={newTerminalType}
              onChange={e => setNewTerminalType(e.target.value as 'done' | 'cancelled')}
              className="text-sm border border-slate-200 rounded-lg px-2 py-2"
            >
              <option value="done">Done</option>
              <option value="cancelled">Cancelled</option>
            </select>
          )}
          <button
            onClick={handleAdd}
            disabled={!newName.trim()}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus size={14} /> Add
          </button>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-xs text-slate-400">Drag rows to reorder. Changes auto-save on delete/add; click Save for name/color edits.</p>
        <button
          onClick={handleSave}
          className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
            saved
              ? 'bg-green-500 text-white'
              : 'bg-slate-800 text-white hover:bg-slate-700'
          }`}
        >
          {saved ? <CheckCircle size={14} /> : <Save size={14} />}
          {saved ? 'Saved!' : 'Save changes'}
        </button>
      </div>

      <div className="mt-8 border-t border-slate-100 pt-6">
        <h3 className="text-sm font-semibold text-slate-700 mb-1">Status legend</h3>
        <p className="text-xs text-slate-500 mb-3">
          <strong>Terminal</strong> statuses trigger confetti and mark tasks as complete. Non-terminal statuses are shown in "What's Next".
        </p>
        <div className="flex flex-wrap gap-2">
          {statuses.map(s => (
            <div
              key={s.id}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border"
              style={{ backgroundColor: `${s.color}15`, borderColor: `${s.color}40`, color: s.color }}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
              {s.name}
              {s.isTerminal && (
                s.terminalType === 'done'
                  ? <CheckCircle size={10} />
                  : <XCircle size={10} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
