import { NavLink, Outlet } from 'react-router-dom';
import clsx from 'clsx';
import { useStore } from '../store/useStore';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  clsx(
    'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
    isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-200'
  );

export default function Layout() {
  const error = useStore((s) => s.error);
  const clearError = useStore((s) => s.clearError);

  return (
    <div className="flex h-full flex-col">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="text-lg font-semibold tracking-tight">Tasks</div>
            <nav className="flex items-center gap-1">
              <NavLink to="/next" className={linkClass}>What's next</NavLink>
              <NavLink to="/board" className={linkClass}>Board</NavLink>
              <NavLink to="/settings" className={linkClass}>Settings</NavLink>
            </nav>
          </div>
        </div>
      </header>

      {error && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-2 text-sm text-red-800 flex items-center justify-between">
          <span>{error}</span>
          <button
            className="text-red-700 hover:text-red-900 font-medium"
            onClick={clearError}
          >
            Dismiss
          </button>
        </div>
      )}

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
