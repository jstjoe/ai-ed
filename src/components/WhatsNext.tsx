"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { selectWhatsNext } from "@/lib/whatsNext";
import {
  Status,
  Task,
  TIME_BUCKETS,
  TIME_BUCKET_BY_ID,
  TimeBucketId,
} from "@/lib/types";
import { TaskForm } from "./TaskForm";

const PRIORITY_DOT: Record<Task["priority"], string> = {
  high: "bg-red-500",
  medium: "bg-amber-400",
  low: "bg-neutral-400",
};

export function WhatsNext() {
  const tasks = useStore((s) => s.tasks);
  const statuses = useStore((s) => s.statuses);
  const updateTask = useStore((s) => s.updateTask);

  const [bucket, setBucket] = useState<TimeBucketId>("30m");
  const [editing, setEditing] = useState<Task | null>(null);

  const picks = useMemo(
    () => selectWhatsNext(tasks, statuses, bucket, 5),
    [tasks, statuses, bucket],
  );

  const doneStatus = statuses.find((s) => s.isDone);

  const statusById = useMemo(() => {
    const m: Record<string, Status> = {};
    statuses.forEach((s) => (m[s.id] = s));
    return m;
  }, [statuses]);

  return (
    <section className="mb-6 rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">What&apos;s next</h2>
          <p className="text-xs text-neutral-500">
            Tasks that fit your available time, ordered by priority.
          </p>
        </div>
        <div className="flex flex-wrap gap-1">
          {TIME_BUCKETS.map((b) => (
            <button
              key={b.id}
              onClick={() => setBucket(b.id)}
              className={`rounded-full px-3 py-1 text-xs transition ${
                bucket === b.id
                  ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                  : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>

      {picks.length === 0 ? (
        <p className="rounded-md border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500 dark:border-neutral-700">
          Nothing fits in {TIME_BUCKET_BY_ID[bucket].label}. Add a task or pick
          a longer window.
        </p>
      ) : (
        <ul className="divide-y divide-neutral-200 dark:divide-neutral-800">
          {picks.map((t) => {
            const status = statusById[t.statusId];
            const taskBucket = TIME_BUCKET_BY_ID[t.timeEstimate];
            return (
              <li
                key={t.id}
                className="flex items-center gap-3 py-2"
              >
                <span
                  className={`h-2 w-2 rounded-full ${PRIORITY_DOT[t.priority]}`}
                  title={`${t.priority} priority`}
                />
                <button
                  type="button"
                  onClick={() => setEditing(t)}
                  className="flex-1 truncate text-left text-sm hover:underline"
                >
                  {t.title}
                </button>
                <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                  {taskBucket?.label ?? t.timeEstimate}
                </span>
                {status && (
                  <span
                    className="rounded px-1.5 py-0.5 text-xs"
                    style={{
                      backgroundColor: `${status.color}22`,
                      color: status.color,
                    }}
                  >
                    {status.name}
                  </span>
                )}
                {doneStatus && (
                  <button
                    type="button"
                    onClick={() =>
                      updateTask(t.id, { statusId: doneStatus.id })
                    }
                    className="rounded-md border border-neutral-200 px-2 py-1 text-xs hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
                  >
                    Done
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <TaskForm
        open={editing !== null}
        task={editing}
        onClose={() => setEditing(null)}
      />
    </section>
  );
}
