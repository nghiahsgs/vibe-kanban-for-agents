"use client";

import { Draggable } from "@hello-pangea/dnd";
import { Calendar, MessageSquare, Paperclip, ChevronUp, Minus, ChevronDown, ChevronsUp } from "lucide-react";
import type { Task } from "@/types";

/* Exact priority config from reference design */
const PRIORITY_CONFIG: Record<string, { icon: typeof ChevronUp; label: string; color: string; bg: string }> = {
  high: { icon: ChevronUp, label: "High", color: "#f97316", bg: "bg-orange-500/10 text-orange-400" },
  medium: { icon: Minus, label: "Medium", color: "#f59e0b", bg: "bg-amber-500/10 text-amber-400" },
  low: { icon: ChevronDown, label: "Low", color: "#22c55e", bg: "bg-green-500/10 text-green-400" },
};

/* Avatar colors matching reference */
const AVATAR_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4"];

function getAvatarColor(name: string) {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}

function getInitials(name: string) {
  return name.split(/[\s-]/).slice(0, 2).map(p => p[0]?.toUpperCase() ?? "").join("") || name.slice(0, 2).toUpperCase();
}

interface TaskCardProps {
  task: Task;
  index: number;
  onClick: (taskId: string) => void;
}

export function TaskCard({ task, index, onClick }: TaskCardProps) {
  const cfg = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
  const PriorityIcon = cfg.icon;
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
            className={`group relative bg-[#1e2535] border rounded-xl p-3.5 cursor-grab active:cursor-grabbing select-none transition-all duration-200 ${
              snapshot.isDragging
                ? "opacity-30 scale-95 border-blue-500/50"
                : "border-[#2d3748] hover:border-[#3d4f6e] hover:bg-[#232d40] shadow-sm hover:shadow-lg hover:shadow-black/20"
            }`}
          >
            {/* Title */}
            <p className="text-sm font-medium text-slate-200 leading-relaxed mb-2">
              {task.title}
            </p>

            {/* Description */}
            {task.description && (
              <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-2.5">
                {task.description}
              </p>
            )}

            {/* Bottom row: avatar + priority | date + icons */}
            <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-[#2d3748]/70">
              <div className="flex items-center gap-2">
                {/* Avatar */}
                {task.assignee ? (
                  <div
                    className="flex items-center justify-center w-6 h-6 rounded-full text-white text-[9px] font-bold shrink-0"
                    style={{ backgroundColor: getAvatarColor(task.assignee) }}
                  >
                    {getInitials(task.assignee)}
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full bg-slate-700/50 shrink-0" />
                )}

                {/* Priority badge */}
                <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${cfg.bg}`}>
                  <PriorityIcon size={10} />
                  {cfg.label}
                </span>
              </div>

              <div className="flex items-center gap-2 text-slate-600">
                <span className="flex items-center gap-1 text-[11px] text-slate-500">
                  <Calendar size={10} />
                  {formatDate(task.updatedAt)}
                </span>
                <span className="flex items-center gap-1 text-[11px] text-slate-600 hover:text-slate-400 transition-colors">
                  <MessageSquare size={11} />
                </span>
                <span className="flex items-center gap-1 text-[11px] text-slate-600 hover:text-slate-400 transition-colors">
                  <Paperclip size={11} />
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}
