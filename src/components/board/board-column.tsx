"use client";

import { Droppable } from "@hello-pangea/dnd";
import { TaskCard } from "./task-card";
import { Plus } from "lucide-react";
import type { Task } from "@/types";

const columnConfig: Record<string, { dot: string; count: string }> = {
  todo: {
    dot: "bg-zinc-400",
    count: "bg-white/[0.05] text-zinc-500",
  },
  in_progress: {
    dot: "bg-blue-400",
    count: "bg-blue-500/10 text-blue-400",
  },
  review: {
    dot: "bg-amber-400",
    count: "bg-amber-500/10 text-amber-400",
  },
  done: {
    dot: "bg-emerald-400",
    count: "bg-emerald-500/10 text-emerald-400",
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
    <div className="flex flex-col min-w-[280px] flex-1 rounded-xl border border-white/[0.06] bg-white/[0.02]">
      {/* Column header */}
      <div className="flex items-center gap-2.5 px-4 py-2.5 border-b border-white/[0.06]">
        <span className={`w-2 h-2 rounded-full shrink-0 ${config.dot}`} />
        <h2 className="font-semibold text-xs uppercase tracking-widest text-zinc-500">{label}</h2>
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
            className={`flex-1 min-h-[200px] p-2.5 transition-colors rounded-b-xl ${
              snapshot.isDraggingOver ? "bg-indigo-500/[0.04]" : ""
            }`}
          >
            {tasks.length === 0 && !snapshot.isDraggingOver && (
              <div className="flex flex-col items-center justify-center h-full min-h-[160px] gap-2">
                <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center">
                  <Plus className="h-3.5 w-3.5 text-zinc-600" />
                </div>
                <p className="text-xs text-zinc-600">No tasks</p>
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
