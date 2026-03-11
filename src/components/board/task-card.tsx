"use client";

import { Draggable } from "@hello-pangea/dnd";
import type { Task } from "@/types";

const priorityBorder: Record<string, string> = {
  high: "border-l-red-500",
  medium: "border-l-amber-500",
  low: "border-l-emerald-500",
};

interface TaskCardProps {
  task: Task;
  index: number;
  onClick: (taskId: string) => void;
}

export function TaskCard({ task, index, onClick }: TaskCardProps) {
  const borderColor = priorityBorder[task.priority] || priorityBorder.medium;

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onClick(task.id)}
          className="mb-2"
        >
          <div
            className={`bg-card rounded-lg border border-border/50 border-l-4 ${borderColor} p-3 cursor-pointer
              transition-all duration-150 hover:shadow-md hover:border-border
              ${snapshot.isDragging ? "shadow-lg scale-[1.02] opacity-90" : "shadow-sm"}`}
          >
            <p className="text-sm font-medium leading-snug text-foreground mb-1.5 line-clamp-2">
              {task.title}
            </p>
            {task.assignee && (
              <p className="text-xs text-muted-foreground truncate">
                {task.assignee}
              </p>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
}
