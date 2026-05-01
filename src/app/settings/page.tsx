"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { Status } from "@/lib/types";

function StatusRow({ status }: { status: Status }) {
  const updateStatus = useStore((s) => s.updateStatus);
  const deleteStatus = useStore((s) => s.deleteStatus);
  const statuses = useStore((s) => s.statuses);

  return (
    <li className="flex items-center gap-3 py-2">
      <input
        type="color"
        value={status.color}
        onChange={(e) => updateStatus(status.id, { color: e.target.value })}
        className="h-8 w-10 cursor-pointer rounded border border-neutral-300 bg-transparent dark:border-neutral-700"
        aria-label={`Color for ${status.name}`}
      />
      <input
        type="text"
        value={status.name}
        onChange={(e) => updateStatus(status.id, { name: e.target.value })}
        className="flex-1 rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm dark:border-neutral-700 dark:bg-neutral-800"
      />
      <label className="flex items-center gap-1 text-xs">
        <input
          type="checkbox"
          checked={!!status.isDone}
          onChange={(e) =>
            updateStatus(status.id, {
              isDone: e.target.checked,
              isCancelled: e.target.checked ? false : status.isCancelled,
            })
          }
        />
        Done
      </label>
      <label className="flex items-center gap-1 text-xs">
        <input
          type="checkbox"
          checked={!!status.isCancelled}
          onChange={(e) =>
            updateStatus(status.id, {
              isCancelled: e.target.checked,
              isDone: e.target.checked ? false : status.isDone,
            })
          }
        />
        Cancelled
      </label>
      <button
        type="button"
        disabled={statuses.length <= 1}
        onClick={() => {
          if (
            confirm(
              `Delete status "${status.name}"? Tasks in this status will be moved.`,
            )
          ) {
            deleteStatus(status.id);
          }
        }}
        className="rounded-md px-2 py-1 text-xs text-red-600 hover:bg-red-50 disabled:opacity-30 dark:hover:bg-red-950"
      >
        Delete
      </button>
    </li>
  );
}

export default function SettingsPage() {
  const statuses = useStore((s) => s.statuses);
  const addStatus = useStore((s) => s.addStatus);
  const reorderStatuses = useStore((s) => s.reorderStatuses);

  const [name, setName] = useState("");
  const [color, setColor] = useState("#64748b");

  const move = (id: string, direction: -1 | 1) => {
    const ids = statuses.map((s) => s.id);
    const idx = ids.indexOf(id);
    const next = idx + direction;
    if (idx < 0 || next < 0 || next >= ids.length) return;
    [ids[idx], ids[next]] = [ids[next], ids[idx]];
    reorderStatuses(ids);
  };

  return (
    <main>
      <h1 className="mb-1 text-xl font-semibold">Settings</h1>
      <p className="mb-6 text-sm text-neutral-500">
        Customize statuses, colors, and which ones mark a task as done or
        cancelled (these trigger confetti).
      </p>

      <section className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
        <h2 className="mb-3 text-base font-semibold">Statuses</h2>
        <ul className="divide-y divide-neutral-200 dark:divide-neutral-800">
          {statuses.map((s, i) => (
            <li key={s.id} className="flex items-center gap-2">
              <div className="flex flex-col">
                <button
                  type="button"
                  onClick={() => move(s.id, -1)}
                  disabled={i === 0}
                  aria-label="Move up"
                  className="text-xs text-neutral-400 hover:text-neutral-700 disabled:opacity-30 dark:hover:text-neutral-200"
                >
                  ▲
                </button>
                <button
                  type="button"
                  onClick={() => move(s.id, 1)}
                  disabled={i === statuses.length - 1}
                  aria-label="Move down"
                  className="text-xs text-neutral-400 hover:text-neutral-700 disabled:opacity-30 dark:hover:text-neutral-200"
                >
                  ▼
                </button>
              </div>
              <div className="flex-1">
                <StatusRow status={s} />
              </div>
            </li>
          ))}
        </ul>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim()) return;
            addStatus(name.trim(), color);
            setName("");
            setColor("#64748b");
          }}
          className="mt-4 flex items-center gap-2 border-t border-neutral-200 pt-4 dark:border-neutral-800"
        >
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="h-8 w-10 cursor-pointer rounded border border-neutral-300 bg-transparent dark:border-neutral-700"
            aria-label="New status color"
          />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="New status name"
            className="flex-1 rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm dark:border-neutral-700 dark:bg-neutral-800"
          />
          <button
            type="submit"
            className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            Add
          </button>
        </form>
      </section>
    </main>
  );
}
