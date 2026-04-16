import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Task } from '@/types/task';
import type { StatusConfig } from '@/types/settings';
import { KanbanCard } from './KanbanCard';
import { Button } from '@/components/ui/Button';

interface KanbanColumnProps {
  status: StatusConfig;
  tasks: Task[];
  onAddTask: (statusId: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

export function KanbanColumn({ status, tasks, onAddTask, onEditTask, onDeleteTask }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `col-${status.id}`,
    data: { type: 'column', statusId: status.id },
  });

  const cardIds = tasks.map((t) => `card-${t.id}`);

  return (
    <div className="flex flex-col w-72 flex-shrink-0">
      <div className="flex items-center gap-2 mb-3 px-1">
        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: status.color }} />
        <span className="text-sm font-semibold text-slate-200 flex-1">{status.name}</span>
        <span className="text-xs text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded-full">
          {tasks.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={`flex-1 rounded-xl p-2 min-h-32 flex flex-col gap-2 transition-colors ${
          isOver ? 'bg-slate-700/60 ring-2 ring-inset ring-indigo-500/40' : 'bg-slate-800/30'
        }`}
      >
        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <KanbanCard
              key={task.id}
              task={task}
              status={status}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
            />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="flex-1 flex items-center justify-center text-xs text-slate-600 py-4">
            Drop tasks here
          </div>
        )}
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="mt-2 w-full justify-center text-slate-500 hover:text-slate-300"
        onClick={() => onAddTask(status.id)}
      >
        + Add task
      </Button>
    </div>
  );
}
