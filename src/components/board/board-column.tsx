"use client";

import { Droppable } from "@hello-pangea/dnd";
import { TaskCard } from "./task-card";
import { Plus } from "lucide-react";
import type { Task } from "@/types";

const columnConfig: Record<string, { dot: string; count: string }> = {
  todo: {
    dot: "bg-zinc-400",
    count: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  },
  in_progress: {
    dot: "bg-blue-400",
    count: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
  },
  review: {
    dot: "bg-yellow-400",
    count: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400",
  },
  done: {
    dot: "bg-emerald-400",
    count: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
  },
};

interface BoardColumnProps {
  status: string;
  label: string;
  tasks: Task[];
  onTaskClick: (taskId: string) => void;
}

export function BoardColumn({ status, label, tasks, onTaskClick }: BoardColumnProps) {
  const config = columnConfig[status] || columnConfig.todo;

  return (
    <div className="flex flex-col min-w-[280px] flex-1 rounded-xl border border-border bg-card/50">
      {/* Column header */}
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border">
        <span className={`w-2 h-2 rounded-full shrink-0 ${config.dot}`} />
        <h2 className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">{label}</h2>
        <span className={`ml-auto text-[11px] font-semibold tabular-nums px-1.5 py-0.5 rounded-md ${config.count}`}>
          {tasks.length}
        </span>
      </div>

      {/* Droppable area */}
      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 min-h-[200px] p-2.5 transition-colors rounded-b-xl ${
              snapshot.isDraggingOver
                ? "bg-accent/50"
                : ""
            }`}
          >
            {tasks.length === 0 && !snapshot.isDraggingOver && (
              <div className="flex flex-col items-center justify-center h-full min-h-[160px] gap-2">
                <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                  <Plus className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground">No tasks</p>
              </div>
            )}
            {tasks.map((task, index) => (
              <TaskCard key={task.id} task={task} index={index} onClick={onTaskClick} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
