"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Bot } from "lucide-react";
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
    <div className="flex items-center justify-between mb-8">
      <BoardSwitcher currentBoardSlug={boardSlug} />
      <div className="flex items-center gap-2">
        <Select value={filterAssignee ?? "all"} onValueChange={onFilterChange}>
          <SelectTrigger className="w-[160px] h-9 text-sm">
            <SelectValue placeholder="Filter by assignee" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All assignees</SelectItem>
            {assignees.map((a) => (
              <SelectItem key={a} value={a}>
                {a}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {board && (
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-1.5"
            onClick={() => setIsAgentOpen(true)}
          >
            <Bot className="h-4 w-4" />
            Agent Setup
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={toggleTheme}
          aria-label="Toggle dark mode"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <Button
          onClick={onNewTask}
          size="sm"
          className="h-9 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white border-0"
        >
          + New Task
        </Button>
        <UserMenu />
      </div>

      {board && (
        <AgentOnboardingDialog
          board={board}
          open={isAgentOpen}
          onOpenChange={setIsAgentOpen}
        />
      )}
    </div>
  );
}
