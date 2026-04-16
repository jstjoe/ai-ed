import { useState } from 'react';
import { Clock, Zap, Plus, ArrowRight } from 'lucide-react';
import { TimeEstimate, TIME_BUDGETS, TIME_ESTIMATES, PRIORITY_ORDER, Task } from '../types';
import { useStore } from '../store';

interface Props {
  onEditTask: (task: Task) => void;
  onNewTask: () => void;
}

const TIME_BUDGET_FITS: Record<string, TimeEstimate[]> = {
  '5m': ['5m'],
  '15m': ['5m', '15m'],
  '30m': ['5m', '15m', '30m'],
  '60m': ['5m', '15m', '30m', '60m'],
  '2-3h': ['5m', '15m', '30m', '60m', '2-3h'],
  '3+h': ['5m', '15m', '30m', '60m', '2-3h', '3+h'],
};

export default function WhatsNext({ onEditTask, onNewTask }: Props) {
  const { state } = useStore();
  const [budget, setBudget] = useState<TimeEstimate | null>(null);

  const terminalIds = new Set(
    state.settings.statuses.filter(s => s.isTerminal).map(s => s.id)
  );

  const activeTasks = state.tasks.filter(t => !terminalIds.has(t.statusId));

  const filteredTasks = budget
    ? activeTasks.filter(t => {
        if (t.timeEstimate === 'unknown') return true;
        const fits = TIME_BUDGET_FITS[budget] ?? [];
        return fits.includes(t.timeEstimate);
      })
    : activeTasks;

  const sorted = [...filteredTasks].sort((a, b) => {
    const pA = PRIORITY_ORDER[a.priority];
    const pB = PRIORITY_ORDER[b.priority];
    if (pA !== pB) return pA - pB;
    const tA = TIME_ESTIMATES.find(t => t.value === a.timeEstimate)?.minutes ?? Infinity;
    const tB = TIME_ESTIMATES.find(t => t.value === b.timeEstimate)?.minutes ?? Infinity;
    return tA - tB;
  });

  const top = sorted.slice(0, 5);

  const statusMap = Object.fromEntries(state.settings.statuses.map(s => [s.id, s]));

  const PRIORITY_BADGE: Record<string, string> = {
    urgent: 'bg-red-100 text-red-700',
    high: 'bg-orange-100 text-orange-700',
    medium: 'bg-yellow-100 text-yellow-700',
    low: 'bg-slate-100 text-slate-500',
  };

  return (
    <div className="h-full flex flex-col p-6 max-w-2xl mx-auto w-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-amber-100 rounded-lg">
          <Zap size={20} className="text-amber-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800">What's Next?</h2>
          <p className="text-sm text-slate-500">How much time do you have?</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {TIME_BUDGETS.map(t => (
          <button
            key={t.value}
            onClick={() => setBudget(prev => prev === t.value ? null : t.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
              budget === t.value
                ? 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-200'
                : 'bg-white text-slate-600 border-slate-200 hover:border-amber-300 hover:text-amber-600'
            }`}
          >
            {t.label}
          </button>
        ))}
        {budget && (
          <button
            onClick={() => setBudget(null)}
            className="px-4 py-2 rounded-full text-sm font-medium text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            Clear
          </button>
        )}
      </div>

      {activeTasks.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-4">
          <div className="text-5xl">🎉</div>
          <div>
            <p className="font-semibold text-slate-700">All clear!</p>
            <p className="text-sm text-slate-500 mt-1">No active tasks. Add something new.</p>
          </div>
          <button
            onClick={onNewTask}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            <Plus size={16} /> New Task
          </button>
        </div>
      ) : top.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-3">
          <Clock size={40} className="text-slate-300" />
          <p className="text-slate-500">No tasks fit in {TIME_BUDGETS.find(t => t.value === budget)?.label}.</p>
          <p className="text-sm text-slate-400">Try a longer time window or add shorter tasks.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {top.map((task, i) => {
            const status = statusMap[task.statusId];
            const timeLabel = TIME_ESTIMATES.find(t => t.value === task.timeEstimate)?.label ?? '?';
            return (
              <div
                key={task.id}
                className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
                style={{ borderLeft: `4px solid ${status?.color ?? '#64748b'}` }}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl font-black text-slate-200 leading-none mt-0.5 w-6 shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800 leading-snug">{task.title}</p>
                    {task.description && (
                      <p className="text-sm text-slate-500 mt-1 line-clamp-2">{task.description}</p>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_BADGE[task.priority]}`}>
                        {task.priority}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                        <Clock size={11} /> {timeLabel}
                      </span>
                      {status && (
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ backgroundColor: `${status.color}20`, color: status.color }}
                        >
                          {status.name}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => onEditTask(task)}
                    className="shrink-0 p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                    title="Edit task"
                  >
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            );
          })}

          {sorted.length > 5 && (
            <p className="text-center text-sm text-slate-400 pt-2">
              +{sorted.length - 5} more task{sorted.length - 5 !== 1 ? 's' : ''} in this window
            </p>
          )}
        </div>
      )}
    </div>
  );
}
