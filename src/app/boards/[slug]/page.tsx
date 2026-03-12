import { BoardProvider } from "@/components/board/board-provider";
import { KanbanBoard } from "@/components/board/kanban-board";

export default async function BoardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <main className="min-h-screen bg-background px-6 py-5 md:px-10 md:py-6">
      <BoardProvider>
        <KanbanBoard boardSlug={slug} />
      </BoardProvider>
    </main>
  );
}
