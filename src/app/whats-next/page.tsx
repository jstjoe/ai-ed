import { listStatusesWithTasks } from "@/lib/db/statuses";
import { WhatsNextView } from "@/components/whats-next/WhatsNextView";
import type { RankableTask } from "@/lib/whatsnext";
import type { Duration, Priority } from "@/lib/duration";

export const dynamic = "force-dynamic";

export default async function WhatsNextPage() {
  const statuses = await listStatusesWithTasks();
  const tasks: RankableTask[] = statuses.flatMap((s) =>
    s.tasks.map((t) => ({
      id: t.id,
      title: t.title,
      duration: t.duration as Duration,
      priority: t.priority as Priority,
      dueDate: t.dueDate,
      statusKind: s.kind as "ACTIVE" | "DONE" | "CANCELLED",
    }))
  );

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold">What&apos;s next</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Tell me how much time you have. I&apos;ll surface the best things to
        tackle.
      </p>
      <WhatsNextView tasks={tasks} />
    </div>
  );
}
