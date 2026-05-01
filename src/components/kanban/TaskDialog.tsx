"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  DURATIONS,
  DURATION_LABELS,
  PRIORITIES,
  PRIORITY_LABELS,
  type Duration,
  type Priority,
} from "@/lib/duration";
import {
  createTaskAction,
  deleteTaskAction,
  updateTaskAction,
} from "@/lib/actions/tasks";
import { Trash2, X } from "lucide-react";

type StatusOption = { id: string; name: string };

type ExistingTask = {
  id: string;
  title: string;
  description: string | null;
  statusId: string;
  duration: string;
  priority: string;
  dueDate: Date | null;
};

type Props =
  | {
      mode: "create";
      statusId: string;
      statuses: StatusOption[];
      onClose: () => void;
    }
  | {
      mode: "edit";
      task: ExistingTask;
      statuses: StatusOption[];
      onClose: () => void;
    };

// Due dates are saved as `new Date("YYYY-MM-DD")` (UTC midnight) on submit.
// Read them back via UTC accessors so they round-trip cleanly regardless of
// the user's local timezone.
function toDateInput(d: Date | null) {
  if (!d) return "";
  const date = new Date(d);
  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(date.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function TaskDialog(props: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const initial =
    props.mode === "edit"
      ? {
          title: props.task.title,
          description: props.task.description ?? "",
          statusId: props.task.statusId,
          duration: props.task.duration as Duration,
          priority: props.task.priority as Priority,
          dueDate: toDateInput(props.task.dueDate),
        }
      : {
          title: "",
          description: "",
          statusId: props.statusId,
          duration: "UNKNOWN" as Duration,
          priority: "MEDIUM" as Priority,
          dueDate: "",
        };

  const [form, setForm] = useState(initial);

  function setField<K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K]
  ) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        if (props.mode === "create") {
          await createTaskAction({
            title: form.title,
            description: form.description || undefined,
            statusId: form.statusId,
            duration: form.duration,
            priority: form.priority,
            dueDate: form.dueDate || null,
          });
        } else {
          await updateTaskAction({
            id: props.task.id,
            title: form.title,
            description: form.description,
            statusId: form.statusId,
            duration: form.duration,
            priority: form.priority,
            dueDate: form.dueDate || null,
          });
        }
        router.refresh();
        props.onClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save");
      }
    });
  }

  function handleDelete() {
    if (props.mode !== "edit") return;
    if (!confirm("Delete this task?")) return;
    startTransition(async () => {
      try {
        await deleteTaskAction(props.task.id);
        router.refresh();
        props.onClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete");
      }
    });
  }

  return (
    <Dialog.Root open onOpenChange={(o) => !o && props.onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[480px] max-w-[95vw] -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-background p-5 shadow-xl">
          <div className="mb-3 flex items-start justify-between">
            <Dialog.Title className="text-lg font-semibold">
              {props.mode === "create" ? "New task" : "Edit task"}
            </Dialog.Title>
            <Dialog.Close className="btn-ghost h-7 w-7 p-0" aria-label="Close">
              <X size={16} />
            </Dialog.Close>
          </div>

          <form onSubmit={submit} className="space-y-3">
            <div>
              <label className="label">Title</label>
              <input
                className="input"
                value={form.title}
                onChange={(e) => setField("title", e.target.value)}
                placeholder="What needs doing?"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="label">Description</label>
              <textarea
                className="input min-h-[72px] resize-y"
                value={form.description}
                onChange={(e) => setField("description", e.target.value)}
                placeholder="Optional details..."
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Status</label>
                <select
                  className="input"
                  value={form.statusId}
                  onChange={(e) => setField("statusId", e.target.value)}
                >
                  {props.statuses.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">
                  Duration <span className="text-red-600">*</span>
                </label>
                <select
                  className="input"
                  value={form.duration}
                  onChange={(e) =>
                    setField("duration", e.target.value as Duration)
                  }
                  required
                >
                  {DURATIONS.map((d) => (
                    <option key={d} value={d}>
                      {DURATION_LABELS[d]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Priority</label>
                <select
                  className="input"
                  value={form.priority}
                  onChange={(e) =>
                    setField("priority", e.target.value as Priority)
                  }
                >
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>
                      {PRIORITY_LABELS[p]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Due date</label>
                <input
                  type="date"
                  className="input"
                  value={form.dueDate}
                  onChange={(e) => setField("dueDate", e.target.value)}
                />
              </div>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="mt-4 flex items-center justify-between">
              {props.mode === "edit" ? (
                <button
                  type="button"
                  className="btn-ghost text-red-600"
                  onClick={handleDelete}
                  disabled={pending}
                >
                  <Trash2 size={14} /> Delete
                </button>
              ) : (
                <span />
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  className="btn-outline"
                  onClick={props.onClose}
                  disabled={pending}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={pending}
                >
                  {pending ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
