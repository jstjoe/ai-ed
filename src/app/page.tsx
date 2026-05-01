import { listStatusesWithTasks } from "@/lib/db/statuses";
import { Board } from "@/components/kanban/Board";
import type { Duration, Priority, StatusKind } from "@/lib/duration";

export const dynamic = "force-dynamic";

export default async function BoardPage() {
  const raw = await listStatusesWithTasks();
  const statuses = raw.map((s) => ({
    id: s.id,
    name: s.name,
    color: s.color,
    order: s.order,
    kind: s.kind as StatusKind,
    tasks: s.tasks.map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      statusId: t.statusId,
      duration: t.duration as Duration,
      priority: t.priority as Priority,
      dueDate: t.dueDate,
      position: t.position,
    })),
  }));
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Board</h1>
      </div>
      <Board statuses={statuses} />
    </div>
  );
}
