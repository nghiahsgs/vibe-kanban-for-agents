"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useBoards, useCreateBoard } from "@/hooks/use-boards";
import { BoardProvider } from "@/components/board/board-provider";

function HomeRedirect() {
  const router = useRouter();
  const { data: boards, isLoading } = useBoards();
  const createBoard = useCreateBoard();
  const creatingRef = useRef(false);

  useEffect(() => {
    if (isLoading) return;
    if (!boards) return;

    // Has boards → redirect to first one
    if (boards.length > 0) {
      router.replace(`/boards/${boards[0].slug}`);
      return;
    }

    // No boards → auto-create a default board (once)
    if (!creatingRef.current) {
      creatingRef.current = true;
      createBoard.mutate(
        { name: "My Board", generateKey: true },
        {
          onSuccess: (board) => {
            router.replace(`/boards/${board.slug}`);
          },
        }
      );
    }
  }, [boards, isLoading, router, createBoard]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <p className="text-muted-foreground text-sm">
        {createBoard.isPending ? "Creating your first board..." : "Loading..."}
      </p>
    </div>
  );
}

export default function Home() {
  return (
    <BoardProvider>
      <HomeRedirect />
    </BoardProvider>
  );
}
