"use client";

import { useMemo, useState } from "react";
import { TIME_SLOTS } from "@/lib/duration";
import { rankTasks, type RankableTask } from "@/lib/whatsnext";
import { Sparkles } from "lucide-react";

const STORAGE_KEY = "ai-ed:lastSlotMinutes";

export function WhatsNextView({ tasks }: { tasks: RankableTask[] }) {
  const [slot, setSlot] = useState<number>(() => {
    if (typeof window === "undefined") return 30;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const n = stored ? Number(stored) : NaN;
    return Number.isFinite(n) ? n : 30;
  });

  function selectSlot(minutes: number) {
    setSlot(minutes);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, String(minutes));
    }
  }

  // Re-hydrate Date objects (server-passed as strings via JSON)
  const normalized = useMemo(
    () =>
      tasks.map((t) => ({
        ...t,
        dueDate: t.dueDate ? new Date(t.dueDate) : null,
      })),
    [tasks]
  );

  const ranked = useMemo(
    () => rankTasks({ tasks: normalized, slotMinutes: slot, limit: 5 }),
    [normalized, slot]
  );

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2">
        {TIME_SLOTS.map((s) => {
          const selected = s.minutes === slot;
          return (
            <button
              key={s.minutes}
              onClick={() => selectSlot(s.minutes)}
              className={
                selected
                  ? "btn-primary"
                  : "btn-outline"
              }
            >
              {s.label}
            </button>
          );
        })}
      </div>

      {ranked.length === 0 ? (
        <div className="card p-8 text-center text-sm text-muted-foreground">
          <Sparkles className="mx-auto mb-2" size={20} />
          No tasks fit a {slot}-minute slot. Try a longer window or add tasks.
        </div>
      ) : (
        <ol className="space-y-2">
          {ranked.map((t, i) => (
            <li key={t.id} className="card flex items-start gap-3 p-3">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                {i + 1}
              </span>
              <div className="flex-1">
                <div className="font-medium">{t.title}</div>
                {t.reasons.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {t.reasons.map((r) => (
                      <span key={r} className="chip">
                        {r}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
