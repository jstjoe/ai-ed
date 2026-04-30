import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import BoardPage from './pages/BoardPage';
import NextPage from './pages/NextPage';
import SettingsPage from './pages/SettingsPage';
import { useStore } from './store/useStore';

export default function App() {
  const hydrate = useStore((s) => s.hydrate);
  const loaded = useStore((s) => s.loaded);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  if (!loaded) {
    return (
      <div className="flex h-full items-center justify-center text-slate-500">
        Loading…
      </div>
    );
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/next" replace />} />
        <Route path="/next" element={<NextPage />} />
        <Route path="/board" element={<BoardPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/next" replace />} />
      </Route>
    </Routes>
  );
}
