"use client";

import { Draggable } from "@hello-pangea/dnd";
import { Badge } from "@/components/ui/badge";
import type { Task } from "@/types";

const priorityConfig: Record<string, { color: string; icon: string }> = {
  high: { color: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800", icon: "!!!" },
  medium: { color: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800", icon: "!!" },
  low: { color: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800", icon: "!" },
};

interface TaskCardProps {
  task: Task;
  index: number;
  onClick: (taskId: string) => void;
}

export function TaskCard({ task, index, onClick }: TaskCardProps) {
  const priority = priorityConfig[task.priority] || priorityConfig.medium;

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
            className={`bg-white dark:bg-card rounded-lg border border-border/50 p-3 cursor-pointer
              transition-all duration-150 hover:shadow-md hover:border-border
              ${snapshot.isDragging ? "shadow-xl ring-2 ring-primary/20 rotate-[2deg] scale-[1.02]" : "shadow-sm"}`}
          >
            <p className="font-medium text-[13px] leading-snug text-foreground mb-2">
              {task.title}
            </p>
            <div className="flex items-center gap-1.5 flex-wrap">
              <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-5 font-medium border ${priority.color}`}>
                {task.priority}
              </Badge>
              {task.assignee && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 font-normal bg-muted">
                  {task.assignee}
                </Badge>
              )}
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}
