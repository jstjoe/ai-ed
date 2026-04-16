import { Draggable } from '@hello-pangea/dnd';
import { Clock, Flag, Pencil, Trash2 } from 'lucide-react';
import { Task, Priority, TimeEstimate } from '../types';

interface Props {
  task: Task;
  index: number;
  statusColor: string;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

const PRIORITY_COLORS: Record<Priority, string> = {
  urgent: 'bg-red-100 text-red-700 border-red-200',
  high: 'bg-orange-100 text-orange-700 border-orange-200',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  low: 'bg-slate-100 text-slate-600 border-slate-200',
};

const PRIORITY_DOT: Record<Priority, string> = {
  urgent: 'bg-red-500',
  high: 'bg-orange-400',
  medium: 'bg-yellow-400',
  low: 'bg-slate-400',
};

const TIME_LABELS: Record<TimeEstimate, string> = {
  '5m': '5m',
  '15m': '15m',
  '30m': '30m',
  '60m': '1h',
  '2-3h': '2–3h',
  '3+h': '3+h',
  unknown: '?',
};

export default function TaskCard({ task, index, statusColor, onEdit, onDelete }: Props) {
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`group bg-white rounded-lg border border-slate-200 p-3 shadow-sm transition-shadow ${
            snapshot.isDragging ? 'shadow-lg ring-2 ring-blue-400 ring-opacity-50' : 'hover:shadow-md'
          }`}
          style={{
            ...provided.draggableProps.style,
            borderLeft: `3px solid ${statusColor}`,
          }}
        >
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium text-slate-800 leading-snug flex-1">{task.title}</p>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              <button
                onClick={() => onEdit(task)}
                className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                title="Edit task"
              >
                <Pencil size={12} />
              </button>
              <button
                onClick={() => onDelete(task.id)}
                className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-500"
                title="Delete task"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>

          {task.description && (
            <p className="mt-1 text-xs text-slate-500 line-clamp-2">{task.description}</p>
          )}

          <div className="mt-2 flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded border font-medium ${PRIORITY_COLORS[task.priority]}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${PRIORITY_DOT[task.priority]}`} />
              {task.priority}
            </span>

            <span className="inline-flex items-center gap-1 text-xs text-slate-500">
              <Clock size={11} />
              {TIME_LABELS[task.timeEstimate]}
            </span>
          </div>

          {task.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {task.tags.map(tag => (
                <span key={tag} className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
}
