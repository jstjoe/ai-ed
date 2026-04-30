import { useState } from 'react';
import { Nav } from './components/layout/Nav';
import { KanbanBoard } from './components/kanban/KanbanBoard';
import { WhatsNext } from './components/whats-next/WhatsNext';
import { SettingsPage } from './components/settings/SettingsPage';
import { useTasks } from './hooks/useTasks';
import { useStatuses } from './hooks/useStatuses';

type View = 'next' | 'board' | 'settings';

export default function App() {
  const [view, setView] = useState<View>('next');
  const { tasks, loading: tasksLoading, refetch: refetchTasks } = useTasks();
  const { statuses, loading: statusesLoading, refetch: refetchStatuses } = useStatuses();

  const loading = tasksLoading || statusesLoading;

  function refetchAll() {
    refetchTasks();
    refetchStatuses();
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Nav view={view} onChange={setView} />

      {loading && view !== 'next' ? (
        <div className="flex-1 flex items-center justify-center text-gray-600">Loading…</div>
      ) : (
        <>
          {view === 'next' && <WhatsNext statuses={statuses} />}
          {view === 'board' && (
            <KanbanBoard tasks={tasks} statuses={statuses} onRefetch={refetchAll} />
          )}
          {view === 'settings' && (
            <SettingsPage statuses={statuses} onRefetch={refetchStatuses} />
          )}
        </>
      )}
    </div>
  );
}
