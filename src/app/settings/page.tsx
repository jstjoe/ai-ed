import { getStatusTaskCounts, listStatuses } from "@/lib/db/statuses";
import { StatusEditor } from "@/components/settings/StatusEditor";
import type { StatusKind } from "@/lib/duration";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const [statuses, countMap] = await Promise.all([
    listStatuses(),
    getStatusTaskCounts(),
  ]);

  const rows = statuses.map((s) => ({
    id: s.id,
    name: s.name,
    color: s.color,
    order: s.order,
    kind: s.kind as StatusKind,
    taskCount: countMap[s.id] ?? 0,
  }));

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold">Settings</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Customize your kanban statuses. Each board needs at least one Active,
        one Done, and one Cancelled status.
      </p>
      <StatusEditor initial={rows} />
    </div>
  );
}
