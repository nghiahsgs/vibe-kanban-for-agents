"use client";

import { Droppable } from "@hello-pangea/dnd";
import { TaskCard } from "./task-card";
import { Plus, MoreHorizontal } from "lucide-react";
import type { Task } from "@/types";

/* Column dot colors — exact match to reference */
const COLUMN_COLORS: Record<string, string> = {
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
  totalTasks?: number;
}

export function BoardColumn({ status, label, tasks, onTaskClick, totalTasks = 0 }: BoardColumnProps) {
  const color = COLUMN_COLORS[status] || "#64748b";
  const progress = totalTasks > 0 ? Math.round((tasks.length / totalTasks) * 100) : 0;

  return (
    <div className="flex flex-col w-[300px] min-w-[300px] flex-shrink-0 snap-start">
      <div className="flex flex-col rounded-2xl h-full bg-[#161d2e] border border-[#1e2a3d] transition-all duration-200">
        {/* Header */}
        <div className="px-4 pt-4 pb-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
              <span className="text-sm font-semibold text-slate-200 truncate">{label}</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0 ml-2">
              <span className="text-xs font-semibold text-slate-500 bg-white/5 px-2 py-0.5 rounded-full">
                {tasks.length}
              </span>
              <button className="p-1 rounded-lg hover:bg-white/10 text-slate-600 hover:text-slate-300 transition-colors">
                <MoreHorizontal size={14} />
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, backgroundColor: color }}
            />
          </div>
        </div>

        {/* Cards area */}
        <Droppable droppableId={status}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`flex-1 px-3 pb-3 space-y-0 min-h-[80px] overflow-y-auto transition-all duration-150 ${
                snapshot.isDraggingOver ? "bg-blue-500/5 rounded-b-2xl" : ""
              }`}
            >
              {tasks.length === 0 && !snapshot.isDraggingOver && (
                <div className={`h-24 flex flex-col items-center justify-center border border-dashed rounded-xl gap-1.5 transition-all duration-150 ${
                  snapshot.isDraggingOver ? "border-blue-500/40 bg-blue-500/5" : "border-white/5"
                }`}>
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

        {/* Add task button */}
        <div className="px-3 pb-3">
          <button className="flex items-center gap-2 w-full px-3 py-2 text-xs text-slate-600 hover:text-slate-300 hover:bg-white/5 rounded-xl transition-all group">
            <Plus size={13} className="group-hover:scale-110 transition-transform" />
            Add task
          </button>
        </div>
      </div>
    </div>
  );
}
