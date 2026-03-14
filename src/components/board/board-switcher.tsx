"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Plus, Settings, Kanban } from "lucide-react";
import { useBoards } from "@/hooks/use-boards";
import { BoardCreateDialog } from "./board-create-dialog";
import { BoardSettingsDialog } from "./board-settings-dialog";
import type { Board } from "@/types";

interface BoardSwitcherProps {
  currentBoardSlug?: string;
}

export function BoardSwitcher({ currentBoardSlug }: BoardSwitcherProps) {
  const router = useRouter();
  const { data: boards, isLoading } = useBoards();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [settingsBoard, setSettingsBoard] = useState<Board | null>(null);

  const currentBoard = boards?.find((b) => b.slug === currentBoardSlug);
  const displayName = currentBoard?.name ?? (isLoading ? "Loading..." : "Vibe Kanban");

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          className="flex items-center gap-2 h-9 px-2 rounded-lg font-bold text-xl tracking-tight hover:bg-accent transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Kanban className="h-5 w-5 text-foreground shrink-0" />
          <span className="max-w-[min(240px,50vw)] truncate">{displayName}</span>
          <ChevronDown className="h-4 w-4 text-muted-foreground/70 shrink-0" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          {boards?.map((board) => (
            <DropdownMenuItem
              key={board.id}
              className="flex items-center justify-between group pr-1"
            >
              <button
                className="flex-1 text-left text-sm truncate"
                onClick={() => router.push(`/boards/${board.slug}`)}
              >
                {board.name}
                {board.slug === currentBoardSlug && (
                  <span className="ml-1.5 text-xs text-muted-foreground">(current)</span>
                )}
              </button>
              <button
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-accent transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  setSettingsBoard(board);
                }}
                aria-label={`Settings for ${board.name}`}
              >
                <Settings className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </DropdownMenuItem>
          ))}
          {boards && boards.length > 0 && <DropdownMenuSeparator />}
          <DropdownMenuItem onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create new board
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <BoardCreateDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />

      {settingsBoard && (
        <BoardSettingsDialog
          board={settingsBoard}
          open={!!settingsBoard}
          onOpenChange={(open) => {
            if (!open) setSettingsBoard(null);
          }}
        />
      )}
    </>
  );
}
