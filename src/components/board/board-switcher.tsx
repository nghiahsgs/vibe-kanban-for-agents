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
import { ChevronDown, Plus, Settings, LayoutDashboard } from "lucide-react";
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
        <DropdownMenuTrigger className="flex items-center gap-3 outline-none">
          {/* Logo */}
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
            <LayoutDashboard size={14} className="text-white" />
          </div>
          <span className="text-sm font-bold text-white tracking-tight">Vibe Kanban</span>
          <span className="text-slate-700 text-sm">/</span>
          <span className="text-sm font-medium text-slate-400 max-w-[min(200px,40vw)] truncate">
            {displayName}
          </span>
          <ChevronDown size={14} className="text-slate-600 shrink-0" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56 bg-[#1a2236] border-[#2d3748]">
          {boards?.map((board) => (
            <DropdownMenuItem
              key={board.id}
              className="flex items-center justify-between group pr-1"
            >
              <button
                className="flex-1 text-left text-sm truncate text-slate-300 hover:text-white"
                onClick={() => router.push(`/boards/${board.slug}`)}
              >
                {board.name}
                {board.slug === currentBoardSlug && (
                  <span className="ml-1.5 text-xs text-slate-600">(current)</span>
                )}
              </button>
              <button
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/10 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  setSettingsBoard(board);
                }}
                aria-label={`Settings for ${board.name}`}
              >
                <Settings className="h-3.5 w-3.5 text-slate-500" />
              </button>
            </DropdownMenuItem>
          ))}
          {boards && boards.length > 0 && <DropdownMenuSeparator className="bg-[#2d3748]" />}
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
