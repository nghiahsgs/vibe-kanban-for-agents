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
    border: "border-l-amber-400",
    badge: "bg-amber-500/10 text-amber-400",
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
            className={`rounded-xl border border-white/[0.06] border-l-[3px] ${config.border} px-3.5 py-3 cursor-pointer
              bg-white/[0.03] dark:bg-white/[0.03]
              transition-all duration-200
              hover:bg-white/[0.06] hover:border-white/[0.1]
              ${snapshot.isDragging ? "ring-1 ring-indigo-500/40 bg-white/[0.06] shadow-lg shadow-indigo-500/10" : ""}`}
          >
            <p className="text-[13px] font-medium leading-snug line-clamp-2">
              {task.title}
            </p>
            <div className="flex items-center justify-between mt-2.5 gap-2">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-0">
                <User className="h-3 w-3 shrink-0 opacity-40" />
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
