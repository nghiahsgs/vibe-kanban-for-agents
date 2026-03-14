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
    <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
      <BoardSwitcher currentBoardSlug={boardSlug} />

      <div className="flex items-center gap-2">
        {/* Filter */}
        <Select value={filterAssignee ?? "all"} onValueChange={onFilterChange}>
          <SelectTrigger size="sm" className="w-[160px] text-xs">
            <SelectValue placeholder="All assignees" />
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

        <div className="w-px h-5 bg-border mx-1" />

        {/* Agent & theme */}
        {board && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAgentOpen(true)}
          >
            <Bot className="size-3.5" />
            Agents
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={toggleTheme}
          aria-label="Toggle dark mode"
        >
          {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </Button>

        <div className="w-px h-5 bg-border mx-1" />

        {/* Primary CTA + Account */}
        <Button onClick={onNewTask} size="sm">
          + New Task
        </Button>
        <UserMenu />
      </div>

      {board && (
        <AgentOnboardingDialog
          board={board}
          open={isAgentOpen}
          onOpenChange={setIsAgentOpen}
          boardSlug={boardSlug}
        />
      )}
    </div>
  );
}
