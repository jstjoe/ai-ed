import { Zap, Kanban, Settings } from 'lucide-react';

type View = 'next' | 'board' | 'settings';

interface Props {
  view: View;
  onChange: (v: View) => void;
}

const tabs: { id: View; label: string; icon: React.ReactNode }[] = [
  { id: 'next', label: "What's Next", icon: <Zap size={16} /> },
  { id: 'board', label: 'Kanban Board', icon: <Kanban size={16} /> },
  { id: 'settings', label: 'Settings', icon: <Settings size={16} /> },
];

export function Nav({ view, onChange }: Props) {
  return (
    <header className="border-b border-gray-800 bg-gray-950 sticky top-0 z-40">
      <div className="max-w-screen-2xl mx-auto px-4 flex items-center gap-1 h-14">
        <span className="text-gray-100 font-bold text-lg mr-6 tracking-tight">Tasks</span>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              view === tab.id
                ? 'bg-gray-800 text-gray-100'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>
    </header>
  );
}
