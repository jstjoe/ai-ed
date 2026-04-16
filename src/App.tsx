import { useState } from 'react';
import { LayoutDashboard, Zap, Settings as SettingsIcon, Plus, CheckSquare } from 'lucide-react';
import { StoreProvider, useStore } from './store';
import KanbanBoard from './components/KanbanBoard';
import WhatsNext from './components/WhatsNext';
import Settings from './components/Settings';
import TaskModal from './components/TaskModal';
import { Task } from './types';

type View = 'board' | 'next' | 'settings';

function AppContent() {
  const { state } = useStore();
  const [view, setView] = useState<View>('board');
  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const terminalIds = new Set(
    state.settings.statuses.filter(s => s.isTerminal).map(s => s.id)
  );
  const activeCount = state.tasks.filter(t => !terminalIds.has(t.statusId)).length;
  const doneCount = state.tasks.filter(t => {
    const s = state.settings.statuses.find(st => st.id === t.statusId);
    return s?.isTerminal && s.terminalType === 'done';
  }).length;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-blue-500 rounded-lg">
            <CheckSquare size={18} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-slate-800 leading-tight">Task Tracker</h1>
            <p className="text-xs text-slate-400 leading-tight">
              {activeCount} active · {doneCount} done
            </p>
          </div>
        </div>

        <nav className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
          {([
            ['board', 'Board', LayoutDashboard],
            ['next', "What's Next", Zap],
            ['settings', 'Settings', SettingsIcon],
          ] as [View, string, React.ElementType][]).map(([v, label, Icon]) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
                view === v
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Icon size={14} />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </nav>

        <button
          onClick={() => setNewTaskOpen(true)}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">New Task</span>
        </button>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-hidden flex">
        {view === 'board' && <KanbanBoard />}
        {view === 'next' && (
          <div className="flex-1 overflow-y-auto">
            <WhatsNext
              onEditTask={task => { setEditingTask(task); }}
              onNewTask={() => setNewTaskOpen(true)}
            />
          </div>
        )}
        {view === 'settings' && <Settings />}
      </main>

      {newTaskOpen && (
        <TaskModal onClose={() => setNewTaskOpen(false)} />
      )}
      {editingTask && (
        <TaskModal
          task={editingTask}
          onClose={() => setEditingTask(null)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}
