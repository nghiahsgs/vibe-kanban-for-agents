"use client";

import { Draggable } from "@hello-pangea/dnd";
import { User } from "lucide-react";
import type { Task } from "@/types";

/* Priority colors — semantic tokens from globals.css */
const priorityConfig: Record<string, { border: string; badge: string; label: string }> = {
  high: {
    border: "border-l-priority-high",
    badge: "bg-priority-high-bg text-priority-high-text",
    label: "High",
  },
  medium: {
    border: "border-l-priority-medium",
    badge: "bg-priority-medium-bg text-priority-medium-text",
    label: "Med",
  },
  low: {
    border: "border-l-priority-low",
    badge: "bg-priority-low-bg text-priority-low-text",
    label: "Low",
  },
};

interface TaskCardProps {
  task: Task;
  index: number;
  onClick: (taskId: string) => void;
}

export function TaskCard({ task, index, onClick }: TaskCardProps) {
  const config = priorityConfig[task.priority] || priorityConfig.medium;

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onClick(task.id)}
          className="mb-2 last:mb-0"
        >
          <div
            className={`rounded-xl border border-border border-l-[3px] ${config.border} px-3 py-3 cursor-pointer
              bg-card transition-colors
              hover:bg-accent/50
              ${snapshot.isDragging ? "ring-2 ring-ring/50 bg-accent/50 shadow-lg" : ""}`}
          >
            <p className="text-[13px] font-medium leading-snug line-clamp-2 text-foreground">
              {task.title}
            </p>
            <div className="flex items-center justify-between mt-2 gap-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground min-w-0">
                <User className="size-3.5 shrink-0 opacity-40" />
                <span className="truncate">{task.assignee || "Unassigned"}</span>
              </div>
              <span className={`shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${config.badge}`}>
                {config.label}
              </span>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}
