"use client";

import { Draggable } from "@hello-pangea/dnd";
import { User, Calendar, MessageSquare } from "lucide-react";
import type { Task } from "@/types";

/* Priority config — icons, labels, colors matching reference design */
const priorityConfig: Record<string, { label: string; bg: string; border: string }> = {
  high: {
    label: "High",
    bg: "bg-orange-500/10 text-orange-400",
    border: "border-l-orange-500",
  },
  medium: {
    label: "Medium",
    bg: "bg-amber-500/10 text-amber-400",
    border: "border-l-amber-500",
  },
  low: {
    label: "Low",
    bg: "bg-green-500/10 text-green-400",
    border: "border-l-green-500",
  },
};

/* Avatar colors for assignees */
const AVATAR_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4"];

function getAvatarColor(name: string) {
  const idx = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

function getInitials(name: string) {
  return name.split(" ").slice(0, 2).map(p => p[0]?.toUpperCase() ?? "").join("") || name.slice(0, 2).toUpperCase();
}

interface TaskCardProps {
  task: Task;
  index: number;
  onClick: (taskId: string) => void;
}

export function TaskCard({ task, index, onClick }: TaskCardProps) {
  const config = priorityConfig[task.priority] || priorityConfig.medium;
  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onClick(task.id)}
          className="mb-2.5 last:mb-0"
        >
          <div
            className={`rounded-xl border border-l-[3px] ${config.border} p-3.5 cursor-pointer select-none transition-all duration-200 ${
              snapshot.isDragging
                ? "opacity-80 scale-[0.98] border-blue-500/50 bg-card shadow-2xl shadow-black/30"
                : "border-border bg-card hover:border-[#3d4f6e] hover:bg-accent shadow-sm hover:shadow-lg hover:shadow-black/20"
            }`}
          >
            {/* Title */}
            <p className="text-sm font-medium text-slate-200 leading-relaxed mb-1.5 line-clamp-2">
              {task.title}
            </p>

            {/* Description preview */}
            {task.description && (
              <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-2.5">
                {task.description}
              </p>
            )}

            {/* Bottom row: avatar, priority, date, icons — separated by border */}
            <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-border/70">
              <div className="flex items-center gap-2">
                {/* Assignee avatar */}
                {task.assignee ? (
                  <div
                    className="flex items-center justify-center w-6 h-6 rounded-full text-white text-[9px] font-bold shrink-0"
                    style={{ backgroundColor: getAvatarColor(task.assignee) }}
                  >
                    {getInitials(task.assignee)}
                  </div>
                ) : (
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-700/50 shrink-0">
                    <User className="size-3 text-slate-500" />
                  </div>
                )}

                {/* Priority badge */}
                <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${config.bg}`}>
                  {config.label}
                </span>
              </div>

              <div className="flex items-center gap-2 text-slate-600">
                {/* Date */}
                <span className="flex items-center gap-1 text-[11px] text-slate-500">
                  <Calendar className="size-2.5" />
                  {formatDate(task.updatedAt)}
                </span>
                {/* Comment icon */}
                <MessageSquare className="size-3 text-slate-600 hover:text-slate-400 transition-colors" />
              </div>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}
