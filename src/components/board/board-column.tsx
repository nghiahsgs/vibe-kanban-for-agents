"use client";

import { Droppable } from "@hello-pangea/dnd";
import { TaskCard } from "./task-card";
import { Plus } from "lucide-react";
import type { Task } from "@/types";

/* Status colors — semantic tokens from globals.css */
const statusColors: Record<string, { dot: string; count: string }> = {
  todo: {
    dot: "bg-status-todo",
    count: "bg-status-todo-bg text-status-todo-text",
  },
  in_progress: {
    dot: "bg-status-in-progress",
    count: "bg-status-in-progress-bg text-status-in-progress-text",
  },
  review: {
    dot: "bg-status-review",
    count: "bg-status-review-bg text-status-review-text",
  },
  done: {
    dot: "bg-status-done",
    count: "bg-status-done-bg text-status-done-text",
  },
};

interface BoardColumnProps {
  status: string;
  label: string;
  tasks: Task[];
  onTaskClick: (taskId: string) => void;
}

export function BoardColumn({ status, label, tasks, onTaskClick }: BoardColumnProps) {
  const config = statusColors[status] || statusColors.todo;

  return (
    <div className="flex flex-col min-w-[280px] flex-1 rounded-xl border border-border bg-surface-sunken snap-start">
      {/* Column header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
        <span className={`w-2 h-2 rounded-full shrink-0 ${config.dot}`} />
        <h2 className="font-semibold text-xs uppercase tracking-widest text-muted-foreground">{label}</h2>
        <span className={`ml-auto text-[10px] font-semibold tabular-nums px-1.5 py-0.5 rounded ${config.count}`}>
          {tasks.length}
        </span>
      </div>

      {/* Droppable area */}
      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 min-h-[200px] p-2 transition-colors rounded-b-xl ${
              snapshot.isDraggingOver ? "bg-primary/5" : ""
            }`}
          >
            {tasks.length === 0 && !snapshot.isDraggingOver && (
              <div className="flex flex-col items-center justify-center h-full min-h-[160px] gap-2">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                  <Plus className="size-3.5 text-muted-foreground" />
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
