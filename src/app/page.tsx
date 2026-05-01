import { listStatusesWithTasks } from "@/lib/db/statuses";
import { Board } from "@/components/kanban/Board";

export const dynamic = "force-dynamic";

export default async function BoardPage() {
  const statuses = await listStatusesWithTasks();
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Board</h1>
      </div>
      <Board statuses={statuses} />
    </div>
  );
}
