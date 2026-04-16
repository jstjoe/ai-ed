import { Outlet } from 'react-router-dom';
import { NavBar } from './NavBar';

export function AppShell() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-950">
      <NavBar />
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
