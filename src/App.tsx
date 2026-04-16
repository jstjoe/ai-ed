import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { WhatNextPage } from '@/components/whatsnext/WhatNextPage';
import { SettingsPage } from '@/components/settings/SettingsPage';
import { useTaskStore } from '@/store/taskStore';
import { useSettingsStore } from '@/store/settingsStore';

function HydrationGuard({ children }: { children: React.ReactNode }) {
  const tasksHydrated = useTaskStore((s) => s._hasHydrated);
  const settingsHydrated = useSettingsStore((s) => s._hasHydrated);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (tasksHydrated && settingsHydrated) {
      setReady(true);
    }
  }, [tasksHydrated, settingsHydrated]);

  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="text-slate-400 text-sm animate-pulse">Loading…</div>
      </div>
    );
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <HydrationGuard>
      <HashRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<KanbanBoard />} />
            <Route path="whats-next" element={<WhatNextPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </HashRouter>
    </HydrationGuard>
  );
}
