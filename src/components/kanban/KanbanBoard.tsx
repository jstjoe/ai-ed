import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import type { Task } from '@/types/task';
import type { StatusConfig } from '@/types/settings';
import { useTaskStore } from '@/store/taskStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useConfetti } from '@/hooks/useConfetti';
import { selectTasksByStatus, selectActiveStatuses } from '@/store/selectors';
import { KanbanColumn } from './KanbanColumn';
import { CardDragOverlay } from './CardDragOverlay';
import { TaskModal } from '@/components/task/TaskModal';

export function KanbanBoard() {
  const tasks = useTaskStore((s) => s.tasks);
  const { addTask, updateTask, deleteTask, moveTask } = useTaskStore();
  const settings = useSettingsStore((s) => s.settings);
  const statuses = selectActiveStatuses(settings.statuses);

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [activeStatus, setActiveStatus] = useState<StatusConfig | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Partial<Task> | undefined>(undefined);

  const { fire: fireConfetti } = useConfetti();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const id = String(event.active.id);
    if (id.startsWith('card-')) {
      const taskId = id.replace('card-', '');
      const task = tasks.find((t) => t.id === taskId);
      if (task) {
        setActiveTask(task);
        const st = statuses.find((s) => s.id === task.statusId) ?? null;
        setActiveStatus(st);
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
    setActiveStatus(null);

    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    if (!activeId.startsWith('card-')) return;
    const taskId = activeId.replace('card-', '');
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    let targetStatusId: string;
    let targetTasks: Task[];

    if (overId.startsWith('col-')) {
      targetStatusId = overId.replace('col-', '');
      targetTasks = selectTasksByStatus(tasks, targetStatusId);
    } else if (overId.startsWith('card-')) {
      const overTaskId = overId.replace('card-', '');
      const overTask = tasks.find((t) => t.id === overTaskId);
      if (!overTask) return;
      targetStatusId = overTask.statusId;
      targetTasks = selectTasksByStatus(tasks, targetStatusId);
    } else {
      return;
    }

    const targetStatus = statuses.find((s) => s.id === targetStatusId);
    if (!targetStatus) return;

    const isTerminalTransition =
      !statuses.find((s) => s.id === task.statusId)?.isTerminal && targetStatus.isTerminal;

    let newSortOrder: number;

    if (task.statusId === targetStatusId) {
      const overTaskId = overId.startsWith('card-') ? overId.replace('card-', '') : null;
      if (!overTaskId) {
        newSortOrder = task.sortOrder;
      } else {
        const oldIndex = targetTasks.findIndex((t) => t.id === taskId);
        const newIndex = targetTasks.findIndex((t) => t.id === overTaskId);
        if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;
        const reordered = arrayMove(targetTasks, oldIndex, newIndex);
        reordered.forEach((t, i) => {
          if (t.id === taskId) newSortOrder = i;
        });
        reordered.forEach((t, i) => {
          if (t.id !== taskId) updateTask(t.id, { sortOrder: i });
        });
        newSortOrder = reordered.findIndex((t) => t.id === taskId);
      }
    } else {
      if (overId.startsWith('card-')) {
        const overTaskId = overId.replace('card-', '');
        const overIndex = targetTasks.findIndex((t) => t.id === overTaskId);
        const prev = targetTasks[overIndex - 1];
        const next = targetTasks[overIndex];
        newSortOrder = prev
          ? (prev.sortOrder + (next?.sortOrder ?? prev.sortOrder + 2)) / 2
          : (next?.sortOrder ?? 0) - 0.5;
      } else {
        const last = targetTasks[targetTasks.length - 1];
        newSortOrder = last ? last.sortOrder + 1 : 0;
      }
    }

    moveTask(taskId, targetStatusId, newSortOrder!);

    if (isTerminalTransition) {
      const now = new Date().toISOString();
      updateTask(taskId, { completedAt: now });
      fireConfetti(targetStatus.isDone);
    }
  };

  const handleAddTask = (statusId: string) => {
    setEditingTask({ statusId });
    setModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  const handleSaveTask = (task: Task) => {
    if (tasks.find((t) => t.id === task.id)) {
      const prevStatus = statuses.find((s) => s.id === tasks.find((t) => t.id === task.id)?.statusId);
      const newStatus = statuses.find((s) => s.id === task.statusId);
      const isTerminalTransition = !prevStatus?.isTerminal && newStatus?.isTerminal;
      updateTask(task.id, { ...task, updatedAt: new Date().toISOString() });
      if (isTerminalTransition) {
        updateTask(task.id, { completedAt: new Date().toISOString() });
        fireConfetti(newStatus!.isDone);
      }
    } else {
      addTask(task);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    if (confirm('Delete this task?')) deleteTask(taskId);
  };

  return (
    <div className="h-[calc(100vh-57px)] overflow-x-auto overflow-y-hidden">
      <div className="flex gap-4 p-6 h-full min-w-max">
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          {statuses.map((status) => (
            <KanbanColumn
              key={status.id}
              status={status}
              tasks={selectTasksByStatus(tasks, status.id)}
              onAddTask={handleAddTask}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
            />
          ))}
          <DragOverlay>
            {activeTask && activeStatus && (
              <CardDragOverlay task={activeTask} status={activeStatus} />
            )}
          </DragOverlay>
        </DndContext>
      </div>

      <TaskModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingTask(undefined); }}
        initialValues={editingTask}
        onSave={handleSaveTask}
      />
    </div>
  );
}
