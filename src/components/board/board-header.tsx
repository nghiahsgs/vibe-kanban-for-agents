"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Bot, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserMenu } from "@/components/auth/user-menu";
import { BoardSwitcher } from "./board-switcher";
import { AgentOnboardingDialog } from "./agent-onboarding-dialog";
import type { Board } from "@/types";

interface BoardHeaderProps {
  onNewTask: () => void;
  filterAssignee: string | null;
  onFilterChange: (value: string | null) => void;
  assignees: string[];
  boardSlug?: string;
  board?: Board | null;
}

export function BoardHeader({
  onNewTask,
  filterAssignee,
  onFilterChange,
  assignees,
  boardSlug,
  board,
}: BoardHeaderProps) {
  const { theme, setTheme } = useTheme();
  const [isAgentOpen, setIsAgentOpen] = useState(false);

  function toggleTheme() {
    setTheme(theme === "dark" ? "light" : "dark");
  }

  return (
    <header className="bg-[#0d1117] border-b border-[#1e2a3d] sticky top-0 z-30 -mx-6 -mt-5 mb-5 px-6">
      {/* Top bar */}
      <div className="h-14 flex items-center justify-between gap-4">
        <BoardSwitcher currentBoardSlug={boardSlug} />

        <div className="flex items-center gap-3">
          {/* Agent button */}
          {board && (
            <button
              onClick={() => setIsAgentOpen(true)}
              className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-400 font-medium hover:border-white/20 hover:text-slate-300 transition-colors"
            >
              <Bot size={12} className="text-slate-500" />
              Agents
            </button>
          )}

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="relative p-1.5 rounded-lg hover:bg-white/10 text-slate-500 hover:text-slate-300 transition-colors"
            aria-label="Toggle dark mode"
          >
            {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          <UserMenu />
        </div>
      </div>

      {/* Sub-bar with filter */}
      <div className="border-t border-[#1e2a3d] h-11 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <span className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/10 text-white">Board</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Filter */}
          <Select value={filterAssignee ?? "all"} onValueChange={onFilterChange}>
            <SelectTrigger
              size="sm"
              className="h-7 w-[160px] text-xs border-white/10 bg-transparent hover:border-white/20"
            >
              <Filter size={11} className="mr-1" />
              <SelectValue placeholder="All assignees" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All assignees</SelectItem>
              {assignees.map((a) => (
                <SelectItem key={a} value={a}>{a}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* New Task */}
          <button
            onClick={onNewTask}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-500 transition-colors"
          >
            + New Task
          </button>
        </div>
      </div>

      {board && (
        <AgentOnboardingDialog
          board={board}
          open={isAgentOpen}
          onOpenChange={setIsAgentOpen}
          boardSlug={boardSlug}
        />
      )}
    </header>
  );
}
