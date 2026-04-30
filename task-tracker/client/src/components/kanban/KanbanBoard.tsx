import { useState, useMemo } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import { Plus } from 'lucide-react';
import type { Task, Status } from '../../types';
import { api } from '../../api';
import { KanbanColumn } from './KanbanColumn';
import { KanbanCard } from './KanbanCard';
import { TaskModal } from '../tasks/TaskModal';
import { fireConfetti } from './confetti';

interface Props {
  tasks: Task[];
  statuses: Status[];
  onRefetch: () => void;
}

export function KanbanBoard({ tasks, statuses, onRefetch }: Props) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [addingToStatus, setAddingToStatus] = useState<number | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const tasksByStatus = useMemo(() => {
    const map: Record<number, Task[]> = {};
    statuses.forEach((s) => { map[s.id] = []; });
    tasks.forEach((t) => { if (map[t.status_id]) map[t.status_id].push(t); });
    return map;
  }, [tasks, statuses]);

  function handleDragStart(event: DragStartEvent) {
    const taskId = String(event.active.id).replace('task-', '');
    const task = tasks.find((t) => t.id === Number(taskId));
    if (task) setActiveTask(task);
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const taskId = Number(String(active.id).replace('task-', ''));
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    // Determine target status id from drop target
    let targetStatusId: number | null = null;
    const overId = String(over.id);

    if (overId.startsWith('col-')) {
      targetStatusId = Number(overId.replace('col-', ''));
    } else if (overId.startsWith('task-')) {
      const overTaskId = Number(overId.replace('task-', ''));
      const overTask = tasks.find((t) => t.id === overTaskId);
      if (overTask) targetStatusId = overTask.status_id;
    }

    if (!targetStatusId || targetStatusId === task.status_id) return;

    const targetStatus = statuses.find((s) => s.id === targetStatusId);
    const updated = await api.tasks.update(task.id, { status_id: targetStatusId });
    onRefetch();

    if (targetStatus && (updated.status_is_done || updated.status_is_terminal)) {
      fireConfetti();
    }
  }

  async function handleDelete(task: Task) {
    setDeletingTask(null);
    await api.tasks.delete(task.id);
    onRefetch();
  }

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
        <h1 className="text-lg font-semibold text-gray-100">Kanban Board</h1>
        <button
          onClick={() => setAddingToStatus(statuses[0]?.id ?? null)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={16} />
          Add Task
        </button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 overflow-x-auto overflow-y-auto">
          <div className="flex gap-4 p-6 h-full" style={{ minWidth: 'max-content' }}>
            {statuses.map((status) => (
              <KanbanColumn
                key={status.id}
                status={status}
                tasks={tasksByStatus[status.id] ?? []}
                onAddTask={(id) => setAddingToStatus(id)}
                onEditTask={setEditingTask}
                onDeleteTask={setDeletingTask}
              />
            ))}
          </div>
        </div>

        <DragOverlay>
          {activeTask && (
            <div className="rotate-2 opacity-90">
              <KanbanCard
                task={activeTask}
                onEdit={() => {}}
                onDelete={() => {}}
              />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {(editingTask || addingToStatus !== null) && (
        <TaskModal
          task={editingTask ?? undefined}
          statuses={statuses}
          defaultStatusId={addingToStatus ?? undefined}
          onClose={() => { setEditingTask(null); setAddingToStatus(null); }}
          onSaved={onRefetch}
        />
      )}

      {deletingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-100 mb-2">Delete Task?</h3>
            <p className="text-gray-400 text-sm mb-6">
              "<span className="text-gray-200">{deletingTask.title}</span>" will be permanently deleted.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleDelete(deletingTask)}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => setDeletingTask(null)}
                className="px-4 py-2 text-gray-400 hover:text-gray-100 hover:bg-gray-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
