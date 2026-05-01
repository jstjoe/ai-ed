import { KanbanBoard } from "@/components/KanbanBoard";
import { WhatsNext } from "@/components/WhatsNext";

export default function Page() {
  return (
    <main>
      <WhatsNext />
      <KanbanBoard />
    </main>
  );
}
