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
    <div className="flex flex-col min-w-[260px] flex-1 rounded-2xl border border-border/60 bg-muted/60 dark:bg-white/[0.04]">
      {/* Column header */}
      <div className="flex items-center gap-2.5 px-4 py-3.5 border-b border-border/40">
        <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${config.dot}`} />
        <h2 className="font-semibold text-[13px] uppercase tracking-wider text-foreground/70">{label}</h2>
        <span className={`ml-auto text-[11px] font-semibold tabular-nums px-2 py-0.5 rounded-full ${config.count}`}>
          {tasks.length}
        </span>
      </div>

      {/* Droppable area */}
      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 min-h-[200px] p-3 space-y-0 transition-colors rounded-b-2xl ${
              snapshot.isDraggingOver
                ? "border-2 border-dashed border-primary/30 bg-primary/5"
                : ""
            }`}
          >
            {tasks.length === 0 && !snapshot.isDraggingOver && (
              <div className="flex flex-col items-center justify-center h-full min-h-[160px] gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-muted/80 dark:bg-white/[0.06] flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground/70"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>
                </div>
                <div className="text-center">
                  <p className="text-xs font-medium text-muted-foreground/80">No tasks yet</p>
                  <p className="text-[11px] text-muted-foreground/50 mt-0.5">Drag here or create new</p>
                </div>
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
