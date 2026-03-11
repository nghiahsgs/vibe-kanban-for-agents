import { BoardProvider } from "@/components/board/board-provider";
import { KanbanBoard } from "@/components/board/kanban-board";

export default function Home() {
  return (
    <main className="min-h-screen bg-muted/30 p-6 md:p-8">
      <BoardProvider>
        <KanbanBoard />
      </BoardProvider>
    </main>
  );
}
