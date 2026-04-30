import { useState } from 'react';
import KanbanBoard from '../components/KanbanBoard';
import TaskDialog from '../components/TaskDialog';

export default function BoardPage() {
  const [creating, setCreating] = useState(false);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-4 pt-4">
        <h1 className="text-xl font-semibold tracking-tight">Board</h1>
        <button
          onClick={() => setCreating(true)}
          className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800"
        >
          + New task
        </button>
      </div>
      <div className="flex-1 min-h-0">
        <KanbanBoard />
      </div>
      <TaskDialog open={creating} onClose={() => setCreating(false)} />
    </div>
  );
}
