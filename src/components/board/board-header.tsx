"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Vibe Kanban</h1>
        <p className="text-sm text-muted-foreground mt-1">Task board for AI agents</p>
      </div>
      <div className="flex items-center gap-3">
        <Select value={filterAssignee ?? "all"} onValueChange={onFilterChange}>
          <SelectTrigger className="w-[180px] h-9 text-sm">
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
        <Button onClick={onNewTask} size="sm" className="h-9">
          + New Task
        </Button>
      </div>
    </div>
  );
}
