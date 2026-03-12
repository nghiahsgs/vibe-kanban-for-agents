"use client";

import { Droppable } from "@hello-pangea/dnd";
import { TaskCard } from "./task-card";
import type { Task } from "@/types";

const columnConfig: Record<string, { dot: string; count: string }> = {
  todo: {
    dot: "bg-slate-400",
    count: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  },
  in_progress: {
    dot: "bg-blue-500",
    count: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
  },
  review: {
    dot: "bg-amber-500",
    count: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  },
  done: {
    dot: "bg-emerald-500",
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
    <div className="flex flex-col min-w-[260px] flex-1 rounded-xl border border-white/10 bg-muted/50 dark:bg-white/[0.03] backdrop-blur-md shadow-sm dark:shadow-black/10">
      {/* Column header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
        <span className={`w-2 h-2 rounded-full shrink-0 ${config.dot}`} />
        <h2 className="font-bold text-sm text-foreground">{label}</h2>
        <span className={`ml-auto text-xs font-semibold tabular-nums px-1.5 py-0.5 rounded-full ${config.count}`}>
          {tasks.length}
        </span>
      </div>

      {/* Droppable area */}
      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 min-h-[200px] p-3 transition-colors rounded-b-xl ${
              snapshot.isDraggingOver
                ? "border-2 border-dashed border-primary/30 bg-primary/5"
                : ""
            }`}
          >
            {tasks.length === 0 && !snapshot.isDraggingOver && (
              <div className="flex flex-col items-center justify-center h-full min-h-[160px] gap-2 opacity-40">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>
                <p className="text-xs font-medium text-muted-foreground">No tasks yet</p>
                <p className="text-[11px] text-muted-foreground/60">Drag here or create new</p>
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
