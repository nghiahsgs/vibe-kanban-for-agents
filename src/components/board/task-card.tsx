"use client";

import { Draggable } from "@hello-pangea/dnd";
import { Calendar, MessageSquare, Paperclip, ChevronUp, Minus, ChevronDown, CheckSquare } from "lucide-react";
import type { Task, Label, ChecklistItem } from "@/types";

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

function parseLabels(raw: string | null): Label[] {
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

function parseChecklist(raw: string | null): ChecklistItem[] {
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

function isOverdue(dateStr: string): boolean {
  return new Date(dateStr) < new Date();
}

interface TaskCardProps {
  task: Task;
  index: number;
  onClick: (taskId: string) => void;
}

export function TaskCard({ task, index, onClick }: TaskCardProps) {
  const cfg = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
  const PriorityIcon = cfg.icon;

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  const labels = parseLabels(task.labels);
  const checklist = parseChecklist(task.checklist);
  const checklistTotal = checklist.length;
  const checklistDone = checklist.filter(i => i.done).length;
  const checklistPct = checklistTotal > 0 ? Math.round((checklistDone / checklistTotal) * 100) : 0;

  const dueDateStr = task.dueDate
    ? formatDate(task.dueDate)
    : formatDate(task.updatedAt);
  const dueDateOverdue = task.dueDate ? isOverdue(task.dueDate) : false;

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
            {/* Labels row */}
            {labels.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {labels.map((label, i) => (
                  <span
                    key={i}
                    style={{ backgroundColor: label.color + "22", color: label.color }}
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide"
                  >
                    {label.text}
                  </span>
                ))}
              </div>
            )}

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

            {/* Checklist progress */}
            {checklistTotal > 0 && (
              <div className="mb-2.5">
                <div className="flex items-center justify-between mb-1">
                  <span className="flex items-center gap-1 text-[10px] text-slate-500">
                    <CheckSquare size={10} />
                    {checklistDone}/{checklistTotal}
                  </span>
                  <span className="text-[10px] text-slate-600">{checklistPct}%</span>
                </div>
                <div className="h-1 w-full bg-[#2d3748] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all"
                    style={{ width: `${checklistPct}%` }}
                  />
                </div>
              </div>
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
                <span className={`flex items-center gap-1 text-[11px] ${dueDateOverdue ? "text-red-400" : "text-slate-500"}`}>
                  <Calendar size={10} />
                  {dueDateStr}
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
