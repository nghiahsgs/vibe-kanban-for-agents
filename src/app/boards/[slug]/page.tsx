import { BoardProvider } from "@/components/board/board-provider";
import { KanbanBoard } from "@/components/board/kanban-board";

export default async function BoardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <main className="min-h-screen bg-background flex flex-col px-6 py-5 overflow-hidden">
      <BoardProvider>
        <KanbanBoard boardSlug={slug} />
      </BoardProvider>
    </main>
  );
}
