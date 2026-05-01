import { listStatuses } from "@/lib/db/statuses";
import { prisma } from "@/lib/db/client";
import { StatusEditor } from "@/components/settings/StatusEditor";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const statuses = await listStatuses();
  const counts = await prisma.task.groupBy({
    by: ["statusId"],
    _count: { _all: true },
  });
  const countMap = Object.fromEntries(
    counts.map((c) => [c.statusId, c._count._all])
  );

  const rows = statuses.map((s) => ({
    id: s.id,
    name: s.name,
    color: s.color,
    order: s.order,
    kind: s.kind,
    taskCount: countMap[s.id] ?? 0,
  }));

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold">Settings</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Customize your kanban statuses. Each board needs at least one Done and
        one Cancelled status.
      </p>
      <StatusEditor initial={rows} />
    </div>
  );
}
