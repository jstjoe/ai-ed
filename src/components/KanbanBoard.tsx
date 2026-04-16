import { useState } from 'react';
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import { Plus } from 'lucide-react';
import { Task } from '../types';
import { useStore } from '../store';
import { useConfetti } from '../hooks/useConfetti';
import TaskCard from './TaskCard';
import TaskModal from './TaskModal';

export default function KanbanBoard() {
  const { state, moveTask, reorderTasks, deleteTask } = useStore();
  const { celebrate } = useConfetti();
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newTaskStatus, setNewTaskStatus] = useState<string | null>(null);

  const statuses = [...state.settings.statuses].sort((a, b) => a.order - b.order);

  const getTasksForStatus = (statusId: string) =>
    state.tasks.filter(t => t.statusId === statusId);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const { draggableId, source, destination } = result;

    if (source.droppableId === destination.droppableId) {
      if (source.index !== destination.index) {
        reorderTasks(source.droppableId, source.index, destination.index);
      }
      return;
    }

    const destStatus = statuses.find(s => s.id === destination.droppableId);
    if (destStatus?.isTerminal) {
      celebrate(destStatus.terminalType ?? 'done');
    }

    moveTask(draggableId, destination.droppableId, destination.index);
  };

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex-1 overflow-x-auto overflow-y-hidden">
          <div className="flex gap-4 h-full p-4 min-w-max">
            {statuses.map(status => {
              const tasks = getTasksForStatus(status.id);
              return (
                <div key={status.id} className="flex flex-col w-72 shrink-0">
                  <div
                    className="flex items-center justify-between px-3 py-2 rounded-t-lg"
                    style={{ backgroundColor: `${status.color}18`, borderBottom: `2px solid ${status.color}` }}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: status.color }}
                      />
                      <span className="text-sm font-semibold text-slate-700">{status.name}</span>
                      <span className="text-xs text-slate-400 bg-white/70 px-1.5 py-0.5 rounded-full">
                        {tasks.length}
                      </span>
                    </div>
                    <button
                      onClick={() => setNewTaskStatus(status.id)}
                      className="p-1 rounded hover:bg-white/50 text-slate-400 hover:text-slate-600"
                      title={`Add task to ${status.name}`}
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <Droppable droppableId={status.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 overflow-y-auto p-2 space-y-2 rounded-b-lg min-h-32 transition-colors ${
                          snapshot.isDraggingOver ? 'bg-blue-50/60' : 'bg-slate-50/40'
                        }`}
                        style={{ maxHeight: 'calc(100vh - 220px)' }}
                      >
                        {tasks.map((task, index) => (
                          <TaskCard
                            key={task.id}
                            task={task}
                            index={index}
                            statusColor={status.color}
                            onEdit={setEditingTask}
                            onDelete={deleteTask}
                          />
                        ))}
                        {provided.placeholder}
                        {tasks.length === 0 && !snapshot.isDraggingOver && (
                          <div className="text-center text-xs text-slate-400 pt-6">
                            Drop tasks here
                          </div>
                        )}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </div>
      </DragDropContext>

      {(editingTask || newTaskStatus) && (
        <TaskModal
          task={editingTask}
          defaultStatusId={newTaskStatus ?? undefined}
          onClose={() => { setEditingTask(null); setNewTaskStatus(null); }}
        />
      )}
    </div>
  );
}
