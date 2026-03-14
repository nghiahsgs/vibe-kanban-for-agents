"use client";

import { Droppable } from "@hello-pangea/dnd";
import { TaskCard } from "./task-card";
import { Plus } from "lucide-react";
import type { Task } from "@/types";

/* Status column colors — dot color for each status */
const statusColors: Record<string, string> = {
  todo: "#64748b",
  in_progress: "#3b82f6",
  review: "#f59e0b",
  done: "#10b981",
};

interface BoardColumnProps {
  status: string;
  label: string;
  tasks: Task[];
  onTaskClick: (taskId: string) => void;
}

export function BoardColumn({ status, label, tasks, onTaskClick }: BoardColumnProps) {
  const dotColor = statusColors[status] || "#64748b";

  return (
    <div className="flex flex-col w-[300px] min-w-[300px] flex-shrink-0 snap-start">
      <div className="flex flex-col rounded-2xl h-full bg-muted border border-border transition-all">
        {/* Column header */}
        <div className="px-4 pt-4 pb-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: dotColor }} />
              <h2 className="text-sm font-semibold text-slate-200 truncate">{label}</h2>
            </div>
            <span className="text-xs font-semibold text-slate-500 bg-white/5 px-2 py-0.5 rounded-full ml-2">
              {tasks.length}
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: tasks.length > 0 ? "100%" : "0%",
                backgroundColor: dotColor,
                opacity: 0.6,
              }}
            />
          </div>
        </div>

        {/* Droppable card area */}
        <Droppable droppableId={status}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`flex-1 px-3 pb-3 min-h-[80px] overflow-y-auto transition-all duration-150 ${
                snapshot.isDraggingOver ? "bg-blue-500/5 rounded-b-2xl" : ""
              }`}
            >
              {tasks.length === 0 && !snapshot.isDraggingOver && (
                <div className="h-24 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-xl gap-1.5">
                  <p className="text-xs text-slate-600">No tasks yet</p>
                  <p className="text-[10px] text-slate-700">Drop here or add one</p>
                </div>
              )}
              {tasks.map((task, index) => (
                <TaskCard key={task.id} task={task} index={index} onClick={onTaskClick} />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>

        {/* Add task button at bottom */}
        <div className="px-3 pb-3">
          <button
            className="flex items-center gap-2 w-full px-3 py-2 text-xs text-slate-600 hover:text-slate-300 hover:bg-white/5 rounded-xl transition-all group"
            onClick={() => {/* will be connected via parent */}}
          >
            <Plus className="size-3.5 group-hover:scale-110 transition-transform" />
            Add task
          </button>
        </div>
      </div>
    </div>
  );
}
