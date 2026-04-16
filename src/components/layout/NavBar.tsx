import { NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Board', icon: '⬛' },
  { to: '/whats-next', label: "What's Next", icon: '⚡' },
  { to: '/settings', label: 'Settings', icon: '⚙' },
];

export function NavBar() {
  return (
    <nav className="bg-slate-900 border-b border-slate-700 px-6 py-3 flex items-center gap-8 sticky top-0 z-40">
      <span className="text-indigo-400 font-bold text-lg tracking-tight">TaskFlow</span>
      <div className="flex items-center gap-1">
        {links.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-600/20 text-indigo-400'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
              }`
            }
          >
            <span className="text-base leading-none">{icon}</span>
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
