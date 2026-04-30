import { useMemo, useState } from 'react';
import TaskCard from '../components/TaskCard';
import TaskDialog from '../components/TaskDialog';
import TimeSlotPicker from '../components/TimeSlotPicker';
import type { Task } from '../data/types';
import { TIME_SLOTS, type TimeSlotId } from '../lib/time';
import { rankWhatsNext } from '../lib/whatsNext';
import { useStore } from '../store/useStore';

const TOP_N = 5;

export default function NextPage() {
  const tasks = useStore((s) => s.tasks);
  const statuses = useStore((s) => s.statuses);
  const moveTask = useStore((s) => s.moveTask);

  const [slotId, setSlotId] = useState<TimeSlotId>('30m');
  const [showAll, setShowAll] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);

  const slot = TIME_SLOTS.find((s) => s.id === slotId)!;
  const ranked = useMemo(
    () => rankWhatsNext(tasks, statuses, slot),
    [tasks, statuses, slot]
  );

  const visible = showAll ? ranked : ranked.slice(0, TOP_N);
  const doneStatus = statuses.find((s) => s.terminalKind === 'done');

  return (
    <div className="mx-auto max-w-3xl p-4 space-y-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">What's next</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Pick how much time you have — I'll surface what to work on.
        </p>
      </div>

      <TimeSlotPicker value={slotId} onChange={(id) => { setSlotId(id); setShowAll(false); }} />

      {ranked.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
          No tasks fit this time slot. Try a longer slot, or add new tasks on the Board.
        </div>
      ) : (
        <div className="space-y-2">
          {visible.map(({ task, reasons }) => (
            <div key={task.id} className="space-y-1">
              <TaskCard task={task} onClick={() => setEditing(task)} />
              <div className="flex items-center gap-2 pl-3">
                {reasons.length > 0 && (
                  <div className="text-[11px] text-slate-500">
                    {reasons.join(' · ')}
                  </div>
                )}
                {doneStatus && task.statusId !== doneStatus.id && (
                  <button
                    onClick={() => moveTask(task.id, doneStatus.id)}
                    className="text-[11px] text-emerald-700 hover:text-emerald-900 font-medium ml-auto"
                  >
                    Mark done →
                  </button>
                )}
              </div>
            </div>
          ))}

          {ranked.length > TOP_N && (
            <button
              onClick={() => setShowAll((v) => !v)}
              className="text-sm text-slate-600 hover:text-slate-900 underline"
            >
              {showAll ? 'Show top 5' : `Show all ${ranked.length} matching`}
            </button>
          )}
        </div>
      )}

      <TaskDialog open={!!editing} initial={editing} onClose={() => setEditing(null)} />
    </div>
  );
}
