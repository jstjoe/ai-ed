import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { StatusEditor } from './StatusEditor';
import type { StatusConfig } from '@/types/settings';

interface StatusRowProps {
  status: StatusConfig;
  taskCount: number;
  onUpdate: (id: string, patch: Partial<StatusConfig>) => void;
  onDelete: (id: string) => void;
  canDelete: boolean;
}

export function StatusRow({ status, taskCount, onUpdate, onDelete, canDelete }: StatusRowProps) {
  const [editing, setEditing] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: status.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  if (editing) {
    return (
      <div style={style}>
        <StatusEditor
          status={status}
          onSave={(patch) => { onUpdate(status.id, patch); setEditing(false); }}
          onCancel={() => setEditing(false)}
        />
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 bg-slate-800 border border-slate-700 rounded-lg px-4 py-3"
    >
      <button
        {...attributes}
        {...listeners}
        className="text-slate-500 hover:text-slate-300 cursor-grab text-sm"
        title="Drag to reorder"
      >
        ⠿
      </button>
      <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: status.color }} />
      <span className="flex-1 text-sm font-medium text-slate-200">{status.name}</span>
      {status.isTerminal && (
        <span className="text-xs text-slate-500 bg-slate-700 px-2 py-0.5 rounded-full">
          {status.isDone ? 'done' : 'terminal'}
        </span>
      )}
      <span className="text-xs text-slate-500">{taskCount} task{taskCount !== 1 ? 's' : ''}</span>
      <button
        onClick={() => setEditing(true)}
        className="text-slate-400 hover:text-slate-100 transition-colors text-sm cursor-pointer px-2"
        title="Edit"
      >
        ✎
      </button>
      {canDelete && (
        <button
          onClick={() => onDelete(status.id)}
          className="text-slate-500 hover:text-red-400 transition-colors text-sm cursor-pointer px-1"
          title="Delete"
        >
          ✕
        </button>
      )}
    </div>
  );
}
