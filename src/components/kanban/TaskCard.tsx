"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { DURATION_LABELS, type Duration, type Priority } from "@/lib/duration";
import { Flag, Clock, Calendar } from "lucide-react";

type TaskRow = {
  id: string;
  title: string;
  description: string | null;
  duration: string;
  priority: string;
  dueDate: Date | null;
};

const PRIORITY_COLOR: Record<Priority, string> = {
  HIGH: "text-red-600",
  MEDIUM: "text-amber-600",
  LOW: "text-slate-400",
};

function formatDue(date: Date) {
  const d = new Date(date);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function isOverdue(date: Date | null) {
  if (!date) return false;
  return new Date(date).getTime() < Date.now();
}

export function TaskCardPresentational({
  task,
  dragging,
  onClick,
}: {
  task: TaskRow;
  dragging?: boolean;
  onClick?: () => void;
}) {
  const overdue = isOverdue(task.dueDate);
  return (
    <button
      type="button"
      onClick={onClick}
      className={`card w-full text-left p-2.5 hover:border-primary/40 ${
        dragging ? "shadow-lg ring-2 ring-primary/30" : ""
      }`}
    >
      <div className="text-sm font-medium leading-snug">{task.title}</div>
      <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
        <span className="chip">
          <Clock size={11} /> {DURATION_LABELS[task.duration as Duration]}
        </span>
        <span
          className={`chip ${PRIORITY_COLOR[task.priority as Priority]}`}
          title={`Priority: ${task.priority}`}
        >
          <Flag size={11} /> {task.priority.toLowerCase()}
        </span>
        {task.dueDate && (
          <span className={`chip ${overdue ? "text-red-600" : ""}`}>
            <Calendar size={11} /> {formatDue(task.dueDate)}
          </span>
        )}
      </div>
    </button>
  );
}

export function TaskCard({
  task,
  onEdit,
}: {
  task: TaskRow;
  onEdit: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCardPresentational task={task} onClick={onEdit} />
    </div>
  );
}
