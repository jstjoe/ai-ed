"use client";

import { useDraggable } from "@dnd-kit/core";
import { Task, TIME_BUCKET_BY_ID } from "@/lib/types";

const PRIORITY_DOT: Record<Task["priority"], string> = {
  high: "bg-red-500",
  medium: "bg-amber-400",
  low: "bg-neutral-400",
};

interface Props {
  task: Task;
  onEdit: (task: Task) => void;
}

export function TaskCard({ task, onEdit }: Props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: task.id, data: { task } });

  const style: React.CSSProperties = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    opacity: isDragging ? 0.4 : 1,
  };

  const bucket = TIME_BUCKET_BY_ID[task.timeEstimate];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group rounded-lg border border-neutral-200 bg-white p-3 shadow-sm hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700"
    >
      <div className="flex items-start gap-2">
        <button
          {...listeners}
          {...attributes}
          aria-label="Drag handle"
          className="cursor-grab touch-none pt-0.5 text-neutral-400 hover:text-neutral-700 active:cursor-grabbing dark:hover:text-neutral-200"
        >
          <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
            <circle cx="6" cy="5" r="1.5" />
            <circle cx="6" cy="10" r="1.5" />
            <circle cx="6" cy="15" r="1.5" />
            <circle cx="14" cy="5" r="1.5" />
            <circle cx="14" cy="10" r="1.5" />
            <circle cx="14" cy="15" r="1.5" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => onEdit(task)}
          className="flex-1 text-left"
        >
          <div className="text-sm font-medium leading-snug">{task.title}</div>
          {task.description && (
            <div className="mt-1 line-clamp-2 text-xs text-neutral-500 dark:text-neutral-400">
              {task.description}
            </div>
          )}
          <div className="mt-2 flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
            <span
              className={`h-2 w-2 rounded-full ${PRIORITY_DOT[task.priority]}`}
              title={`${task.priority} priority`}
            />
            <span className="rounded bg-neutral-100 px-1.5 py-0.5 dark:bg-neutral-800">
              {bucket?.label ?? task.timeEstimate}
            </span>
          </div>
        </button>
      </div>
    </div>
  );
}
