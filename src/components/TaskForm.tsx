"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { Priority, Task, TIME_BUCKETS, TimeBucketId } from "@/lib/types";

interface Props {
  open: boolean;
  onClose: () => void;
  task?: Task | null;
  defaultStatusId?: string;
}

export function TaskForm({ open, onClose, task, defaultStatusId }: Props) {
  const statuses = useStore((s) => s.statuses);
  const addTask = useStore((s) => s.addTask);
  const updateTask = useStore((s) => s.updateTask);
  const deleteTask = useStore((s) => s.deleteTask);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [statusId, setStatusId] = useState<string>("");
  const [timeEstimate, setTimeEstimate] = useState<TimeBucketId>("30m");
  const [priority, setPriority] = useState<Priority>("medium");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    if (task) {
      setTitle(task.title);
      setDescription(task.description ?? "");
      setStatusId(task.statusId);
      setTimeEstimate(task.timeEstimate);
      setPriority(task.priority);
    } else {
      setTitle("");
      setDescription("");
      setStatusId(defaultStatusId ?? statuses[0]?.id ?? "");
      setTimeEstimate("30m");
      setPriority("medium");
    }
    setError(null);
  }, [open, task, defaultStatusId, statuses]);

  if (!open) return null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    if (!timeEstimate) {
      setError("Time estimate is required");
      return;
    }
    if (!statusId) {
      setError("Status is required");
      return;
    }
    if (task) {
      updateTask(task.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        statusId,
        timeEstimate,
        priority,
      });
    } else {
      addTask({
        title: title.trim(),
        description: description.trim() || undefined,
        statusId,
        timeEstimate,
        priority,
      });
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-neutral-900"
      >
        <h2 className="mb-4 text-lg font-semibold">
          {task ? "Edit task" : "New task"}
        </h2>

        <label className="mb-3 block">
          <span className="mb-1 block text-sm font-medium">Title *</span>
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
          />
        </label>

        <label className="mb-3 block">
          <span className="mb-1 block text-sm font-medium">Description</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
          />
        </label>

        <div className="mb-3 grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Time estimate *</span>
            <select
              value={timeEstimate}
              onChange={(e) => setTimeEstimate(e.target.value as TimeBucketId)}
              className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
            >
              {TIME_BUCKETS.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium">Priority</span>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </label>
        </div>

        <label className="mb-4 block">
          <span className="mb-1 block text-sm font-medium">Status</span>
          <select
            value={statusId}
            onChange={(e) => setStatusId(e.target.value)}
            className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
          >
            {statuses.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>

        {error && (
          <p className="mb-3 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}

        <div className="flex items-center justify-between gap-2">
          {task ? (
            <button
              type="button"
              onClick={() => {
                deleteTask(task.id);
                onClose();
              }}
              className="rounded-md px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
            >
              Delete
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md px-3 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-neutral-900 px-3 py-2 text-sm text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
            >
              {task ? "Save" : "Create"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
