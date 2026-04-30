import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState } from 'react';
import type { Status, TerminalKind } from '../data/types';
import { useStore } from '../store/useStore';

const COLOR_PRESETS = [
  '#94a3b8', '#64748b', '#3b82f6', '#0ea5e9', '#06b6d4',
  '#10b981', '#22c55e', '#84cc16', '#eab308', '#f59e0b',
  '#f97316', '#ef4444', '#ec4899', '#a855f7', '#6366f1',
];

interface RowProps {
  status: Status;
}

function StatusRow({ status }: RowProps) {
  const updateStatus = useStore((s) => s.updateStatus);
  const deleteStatus = useStore((s) => s.deleteStatus);
  const statuses = useStore((s) => s.statuses);
  const tasks = useStore((s) => s.tasks);
  const moveTask = useStore((s) => s.moveTask);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: status.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const taskCount = tasks.filter((t) => t.statusId === status.id).length;
  const otherStatuses = statuses.filter((s) => s.id !== status.id);
  const [moveTo, setMoveTo] = useState(otherStatuses[0]?.id ?? '');

  const onDelete = async () => {
    if (taskCount > 0) {
      if (!moveTo) return;
      if (!confirm(
        `Move ${taskCount} task(s) to "${otherStatuses.find((s) => s.id === moveTo)?.name}" and delete "${status.name}"?`
      )) return;
      const toMove = tasks.filter((t) => t.statusId === status.id);
      for (const t of toMove) {
        await moveTask(t.id, moveTo);
      }
      await deleteStatus(status.id);
    } else {
      if (!confirm(`Delete status "${status.name}"?`)) return;
      await deleteStatus(status.id);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 rounded-md border border-slate-200 bg-white px-3 py-2"
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab text-slate-400 hover:text-slate-600 px-1"
        title="Drag to reorder"
      >
        ⋮⋮
      </button>

      <div className="flex items-center gap-2">
        <input
          type="color"
          value={status.color}
          onChange={(e) => updateStatus(status.id, { color: e.target.value })}
          className="h-7 w-7 cursor-pointer rounded border border-slate-300"
        />
        <div className="flex flex-wrap gap-1">
          {COLOR_PRESETS.map((c) => (
            <button
              key={c}
              onClick={() => updateStatus(status.id, { color: c })}
              className="h-4 w-4 rounded-full border border-slate-300"
              style={{ backgroundColor: c }}
              title={c}
            />
          ))}
        </div>
      </div>

      <input
        value={status.name}
        onChange={(e) => updateStatus(status.id, { name: e.target.value })}
        className="flex-1 min-w-[8rem] rounded-md border border-slate-300 px-2 py-1 text-sm"
      />

      <select
        value={status.terminalKind ?? 'none'}
        onChange={(e) => {
          const v = e.target.value;
          const tk: TerminalKind = v === 'none' ? null : (v as TerminalKind);
          updateStatus(status.id, { terminalKind: tk });
        }}
        className="rounded-md border border-slate-300 px-2 py-1 text-xs"
        title="Terminal kind (drives confetti)"
      >
        <option value="none">Active</option>
        <option value="done">Done (confetti)</option>
        <option value="cancelled">Cancelled (confetti)</option>
      </select>

      <span className="text-xs text-slate-500 w-16 text-right">{taskCount} tasks</span>

      {taskCount > 0 ? (
        <div className="flex items-center gap-1">
          <select
            value={moveTo}
            onChange={(e) => setMoveTo(e.target.value)}
            className="rounded-md border border-slate-300 px-2 py-1 text-xs"
          >
            {otherStatuses.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <button
            onClick={onDelete}
            disabled={!moveTo}
            className="text-xs text-red-600 hover:text-red-800 disabled:opacity-30"
          >
            Move & delete
          </button>
        </div>
      ) : (
        <button
          onClick={onDelete}
          className="text-xs text-red-600 hover:text-red-800"
        >
          Delete
        </button>
      )}
    </div>
  );
}

export default function SettingsPage() {
  const statuses = useStore((s) => s.statuses);
  const reorderStatuses = useStore((s) => s.reorderStatuses);
  const createStatus = useStore((s) => s.createStatus);

  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('#6366f1');
  const [newTerminal, setNewTerminal] = useState<TerminalKind>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  );

  const onDragEnd = async (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIdx = statuses.findIndex((s) => s.id === active.id);
    const newIdx = statuses.findIndex((s) => s.id === over.id);
    if (oldIdx === -1 || newIdx === -1) return;
    const reordered = arrayMove(statuses, oldIdx, newIdx);
    await reorderStatuses(reordered.map((s) => s.id));
  };

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    await createStatus({ name: newName.trim(), color: newColor, terminalKind: newTerminal });
    setNewName('');
    setNewTerminal(null);
  };

  return (
    <div className="mx-auto max-w-4xl p-4 space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Customize kanban statuses, colors, and which ones trigger confetti.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Statuses
        </h2>
        <DndContext sensors={sensors} onDragEnd={onDragEnd}>
          <SortableContext
            items={statuses.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {statuses.map((s) => (
                <StatusRow key={s.id} status={s} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Add status
        </h2>
        <form
          onSubmit={onCreate}
          className="flex flex-wrap items-center gap-2 rounded-md border border-slate-200 bg-white p-3"
        >
          <input
            type="color"
            value={newColor}
            onChange={(e) => setNewColor(e.target.value)}
            className="h-9 w-9 cursor-pointer rounded border border-slate-300"
          />
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Status name"
            className="flex-1 min-w-[10rem] rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          />
          <select
            value={newTerminal ?? 'none'}
            onChange={(e) => {
              const v = e.target.value;
              setNewTerminal(v === 'none' ? null : (v as TerminalKind));
            }}
            className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          >
            <option value="none">Active</option>
            <option value="done">Done (confetti)</option>
            <option value="cancelled">Cancelled (confetti)</option>
          </select>
          <button
            type="submit"
            disabled={!newName.trim()}
            className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
          >
            Add
          </button>
        </form>
      </section>
    </div>
  );
}
