import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import type { Status, Task } from '../../types';
import { KanbanCard } from './KanbanCard';

interface Props {
  status: Status;
  tasks: Task[];
  onAddTask: (statusId: number) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
}

export function KanbanColumn({ status, tasks, onAddTask, onEditTask, onDeleteTask }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: `col-${status.id}` });

  return (
    <div className="flex flex-col min-w-[280px] max-w-[320px] flex-shrink-0">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: status.color }} />
          <span className="text-sm font-semibold text-gray-200">{status.name}</span>
          <span className="text-xs text-gray-500 bg-gray-800 px-1.5 py-0.5 rounded-full">{tasks.length}</span>
        </div>
        <button
          onClick={() => onAddTask(status.id)}
          className="text-gray-500 hover:text-gray-200 hover:bg-gray-700 p-1 rounded transition-colors"
          title="Add task"
        >
          <Plus size={16} />
        </button>
      </div>

      <SortableContext
        items={tasks.map((t) => `task-${t.id}`)}
        strategy={verticalListSortingStrategy}
      >
        <div
          ref={setNodeRef}
          className={`flex flex-col gap-2 min-h-[120px] p-2 rounded-xl border transition-colors ${
            isOver
              ? 'border-blue-500/50 bg-blue-950/20'
              : 'border-gray-800 bg-gray-900/40'
          }`}
        >
          {tasks.map((task) => (
            <KanbanCard
              key={task.id}
              task={task}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
            />
          ))}
          {tasks.length === 0 && (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-xs text-gray-600 italic">No tasks</p>
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}
