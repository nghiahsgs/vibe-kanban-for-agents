"use client";

import { Droppable } from "@hello-pangea/dnd";
import { TaskCard } from "./task-card";
import type { Task } from "@/types";

const columnStyles: Record<string, { bg: string; header: string; dot: string }> = {
  todo: {
    bg: "bg-slate-50/80 dark:bg-slate-900/30",
    header: "text-slate-700 dark:text-slate-300",
    dot: "bg-slate-400",
  },
  in_progress: {
    bg: "bg-blue-50/80 dark:bg-blue-900/20",
    header: "text-blue-700 dark:text-blue-300",
    dot: "bg-blue-500",
  },
  review: {
    bg: "bg-amber-50/80 dark:bg-amber-900/20",
    header: "text-amber-700 dark:text-amber-300",
    dot: "bg-amber-500",
  },
  done: {
    bg: "bg-emerald-50/80 dark:bg-emerald-900/20",
    header: "text-emerald-700 dark:text-emerald-300",
    dot: "bg-emerald-500",
  },
};

interface BoardColumnProps {
  status: string;
  label: string;
  tasks: Task[];
  onTaskClick: (taskId: string) => void;
}

export function BoardColumn({ status, label, tasks, onTaskClick }: BoardColumnProps) {
  const style = columnStyles[status] || columnStyles.todo;

  return (
    <div className={`flex flex-col w-[280px] shrink-0 rounded-xl border border-border/40 ${style.bg}`}>
      {/* Column header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border/30">
        <span className={`w-2 h-2 rounded-full ${style.dot}`} />
        <h2 className={`font-semibold text-sm ${style.header}`}>{label}</h2>
        <span className="ml-auto text-xs font-medium text-muted-foreground tabular-nums">
          {tasks.length}
        </span>
      </div>

      {/* Droppable area */}
      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 min-h-[300px] p-2 transition-colors rounded-b-xl ${
              snapshot.isDraggingOver ? "bg-primary/5 ring-1 ring-primary/10 ring-inset" : ""
            }`}
          >
            {tasks.length === 0 && (
              <div className="flex items-center justify-center h-full">
                <p className="text-xs text-muted-foreground/60">No tasks</p>
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
