import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, Plus } from 'lucide-react';
import type { Status } from '../../types';
import { api } from '../../api';

interface RowProps {
  status: Status;
  onChange: (id: number, field: keyof Status, value: unknown) => void;
  onDelete: (id: number) => void;
  onBlur: (id: number) => void;
}

function StatusRow({ status, onChange, onDelete, onBlur }: RowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: status.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-3 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5">
      <button
        {...attributes}
        {...listeners}
        className="text-gray-600 hover:text-gray-400 cursor-grab active:cursor-grabbing touch-none"
      >
        <GripVertical size={16} />
      </button>

      <div className="relative">
        <input
          type="color"
          value={status.color}
          onChange={(e) => onChange(status.id, 'color', e.target.value)}
          onBlur={() => onBlur(status.id)}
          className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent p-0"
          title="Pick color"
        />
      </div>

      <input
        type="text"
        value={status.name}
        onChange={(e) => onChange(status.id, 'name', e.target.value)}
        onBlur={() => onBlur(status.id)}
        className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-1.5 text-sm text-gray-100 focus:outline-none focus:border-blue-500 transition-colors"
      />

      <label className="flex items-center gap-2 text-xs text-gray-400 whitespace-nowrap cursor-pointer">
        <input
          type="checkbox"
          checked={!!status.is_done}
          onChange={(e) => { onChange(status.id, 'is_done', e.target.checked ? 1 : 0); onBlur(status.id); }}
          className="w-4 h-4 rounded accent-green-500"
        />
        Done 🎉
      </label>

      <label className="flex items-center gap-2 text-xs text-gray-400 whitespace-nowrap cursor-pointer">
        <input
          type="checkbox"
          checked={!!status.is_terminal}
          onChange={(e) => { onChange(status.id, 'is_terminal', e.target.checked ? 1 : 0); onBlur(status.id); }}
          className="w-4 h-4 rounded accent-red-500"
        />
        Cancel 🎉
      </label>

      <button
        onClick={() => onDelete(status.id)}
        className="text-gray-600 hover:text-red-400 transition-colors p-1 rounded hover:bg-gray-700"
        title="Delete status"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

interface Props {
  statuses: Status[];
  onRefetch: () => void;
}

export function StatusEditor({ statuses, onRefetch }: Props) {
  const [local, setLocal] = useState<Status[]>(statuses);
  const [error, setError] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function handleChange(id: number, field: keyof Status, value: unknown) {
    setLocal((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  }

  async function handleBlur(id: number) {
    const status = local.find((s) => s.id === id);
    if (!status) return;
    try {
      setError(null);
      await api.statuses.update(id, {
        name: status.name,
        color: status.color,
        is_done: status.is_done,
        is_terminal: status.is_terminal,
      });
      onRefetch();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save');
    }
  }

  async function handleDelete(id: number) {
    try {
      setError(null);
      await api.statuses.delete(id);
      setLocal((prev) => prev.filter((s) => s.id !== id));
      onRefetch();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete');
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = local.findIndex((s) => s.id === active.id);
    const newIndex = local.findIndex((s) => s.id === over.id);
    const reordered = arrayMove(local, oldIndex, newIndex).map((s, i) => ({ ...s, position: i }));
    setLocal(reordered);

    try {
      await api.statuses.reorder(reordered.map((s) => s.id));
      onRefetch();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to reorder');
    }
  }

  async function handleAddStatus() {
    try {
      setError(null);
      const newStatus = await api.statuses.create({
        name: 'New Status',
        color: '#6b7280',
        is_done: 0,
        is_terminal: 0,
      });
      setLocal((prev) => [...prev, newStatus]);
      onRefetch();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create');
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {error && (
        <p className="text-red-400 text-sm bg-red-900/20 border border-red-800 rounded-lg px-3 py-2">{error}</p>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={local.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          {local.map((status) => (
            <StatusRow
              key={status.id}
              status={status}
              onChange={handleChange}
              onDelete={handleDelete}
              onBlur={handleBlur}
            />
          ))}
        </SortableContext>
      </DndContext>

      <button
        onClick={handleAddStatus}
        className="flex items-center gap-2 text-gray-400 hover:text-gray-100 text-sm transition-colors py-2 px-3 border border-dashed border-gray-700 rounded-lg hover:border-gray-500"
      >
        <Plus size={14} /> Add Status
      </button>
    </div>
  );
}
