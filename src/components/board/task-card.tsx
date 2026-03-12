"use client";

import { Draggable } from "@hello-pangea/dnd";
import { User } from "lucide-react";
import type { Task } from "@/types";

const priorityConfig: Record<string, { border: string; badge: string; label: string }> = {
  high: {
    border: "border-l-red-400",
    badge: "bg-red-500/10 text-red-400",
    label: "High",
  },
  medium: {
    border: "border-l-yellow-400",
    badge: "bg-yellow-500/10 text-yellow-400",
    label: "Med",
  },
  low: {
    border: "border-l-emerald-400",
    badge: "bg-emerald-500/10 text-emerald-400",
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
            className={`bg-card rounded-lg border border-border border-l-[3px] ${config.border} px-3 py-2.5 cursor-pointer
              transition-colors duration-150
              hover:bg-accent
              ${snapshot.isDragging ? "ring-1 ring-ring" : ""}`}
          >
            <p className="text-sm font-medium leading-snug text-foreground line-clamp-2">
              {task.title}
            </p>
            <div className="flex items-center justify-between mt-2 gap-2">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-0">
                <User className="h-3 w-3 shrink-0 opacity-50" />
                <span className="truncate">{task.assignee || "Unassigned"}</span>
              </div>
              <span className={`shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded ${config.badge}`}>
                {config.label}
              </span>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}
