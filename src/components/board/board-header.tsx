"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserMenu } from "@/components/auth/user-menu";

interface BoardHeaderProps {
  onNewTask: () => void;
  filterAssignee: string | null;
  onFilterChange: (value: string | null) => void;
  assignees: string[];
}

export function BoardHeader({
  onNewTask,
  filterAssignee,
  onFilterChange,
  assignees,
}: BoardHeaderProps) {
  const { theme, setTheme } = useTheme();

  function toggleTheme() {
    setTheme(theme === "dark" ? "light" : "dark");
  }

  return (
    <div className="flex items-center justify-between mb-8">
      <h1 className="text-xl font-bold tracking-tight">Vibe Kanban</h1>
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
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={toggleTheme}
          aria-label="Toggle dark mode"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <Button onClick={onNewTask} size="sm" className="h-9">
          + New Task
        </Button>
        <UserMenu />
      </div>
    </div>
  );
}
