"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Pencil, Trash2, X, User, FolderOpen, MessageSquare, Calendar, Layers } from "lucide-react";
import { TaskFormDialog } from "./task-form-dialog";
import { DeleteTaskDialog } from "./delete-task-dialog";
import { CommentList } from "./comment-list";
import { CommentForm } from "./comment-form";
import { useUpdateTask } from "@/hooks/use-tasks";
import { useEpics } from "@/hooks/use-epics";
import type { Task, Label, ChecklistItem } from "@/types";

const statusLabels: Record<string, string> = {
  todo: "Todo",
  in_progress: "In Progress",
  review: "In Review",
  done: "Done",
};

const statusDotColors: Record<string, string> = {
  todo: "#64748b",
  in_progress: "#3b82f6",
  review: "#f59e0b",
  done: "#10b981",
};

const priorityConfig: Record<string, { label: string; color: string; bg: string }> = {
  high: { label: "HIGH", color: "#f97316", bg: "bg-orange-500/15 text-orange-400 border border-orange-500/30" },
  medium: { label: "MEDIUM", color: "#f59e0b", bg: "bg-amber-500/15 text-amber-400 border border-amber-500/30" },
  low: { label: "LOW", color: "#22c55e", bg: "bg-green-500/15 text-green-400 border border-green-500/30" },
};

function formatDateTime(d: string) {
  return new Date(d).toLocaleDateString("en-US", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function isOverdue(dateStr: string): boolean {
  return new Date(dateStr) < new Date();
}

function parseLabels(raw: string | null): Label[] {
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

function parseChecklist(raw: string | null): ChecklistItem[] {
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

interface TaskDetailDialogProps {
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  boardSlug?: string;
}

export function TaskDetailDialog({ task, open, onOpenChange, boardSlug }: TaskDetailDialogProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const updateTask = useUpdateTask(boardSlug);
  const { data: epics = [] } = useEpics(boardSlug);

  const pCfg = priorityConfig[task.priority] || priorityConfig.medium;
  const labels = parseLabels(task.labels);
  const checklist = parseChecklist(task.checklist);
  const epic = task.epicId ? epics.find(e => e.id === task.epicId) : null;
  const dueDateOverdue = task.dueDate ? isOverdue(task.dueDate) : false;

  function toggleChecklistItem(itemId: string, done: boolean) {
    const updated = checklist.map(item =>
      item.id === itemId ? { ...item, done } : item
    );
    updateTask.mutate({ id: task.id, checklist: JSON.stringify(updated) });
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent showCloseButton={false} className="sm:max-w-2xl max-h-[85vh] overflow-y-auto p-0">
          {/* Header — title + action icons */}
          <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-[#1e2a3d]">
            <div className="flex-1 pr-4">
              <h2 className="text-lg font-bold text-slate-100 leading-snug break-words">
                {task.title}
              </h2>
              {/* Labels below title */}
              {labels.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
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
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => setIsEditOpen(true)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-500 hover:text-slate-300 transition-colors"
                aria-label="Edit task"
              >
                <Pencil size={16} />
              </button>
              <button
                onClick={() => setIsDeleteOpen(true)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-500 hover:text-red-400 transition-colors"
                aria-label="Delete task"
              >
                <Trash2 size={16} />
              </button>
              <button
                onClick={() => onOpenChange(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-500 hover:text-slate-300 transition-colors"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="px-6 py-5 space-y-5">
            {/* Status + Priority row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-[#1e2a3d] bg-[#161d2e] p-4">
                <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-2">Status</p>
                <p className="text-sm font-medium text-slate-200">{statusLabels[task.status]}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: statusDotColors[task.status] }} />
                  <span className="text-xs text-slate-500">{statusLabels[task.status]}</span>
                </div>
              </div>
              <div className="rounded-xl border border-[#1e2a3d] bg-[#161d2e] p-4">
                <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-2">Priority</p>
                <p className="text-sm font-medium" style={{ color: pCfg.color }}>{task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}</p>
                <span className={`inline-flex items-center mt-1 text-[10px] font-bold px-2 py-0.5 rounded ${pCfg.bg}`}>
                  {pCfg.label}
                </span>
              </div>
            </div>

            {/* Assignee + Due Date/Dates row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-[#1e2a3d] bg-[#161d2e] p-4">
                <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-2">Assignee</p>
                <div className="flex items-center gap-2">
                  <User size={14} className="text-slate-500" />
                  <span className="text-sm text-slate-200">{task.assignee || "Unassigned"}</span>
                </div>
              </div>
              <div className="rounded-xl border border-[#1e2a3d] bg-[#161d2e] p-4">
                {task.dueDate ? (
                  <>
                    <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Calendar size={10} /> Due Date
                    </p>
                    <p className={`text-sm font-medium ${dueDateOverdue ? "text-red-400" : "text-slate-200"}`}>
                      {formatDate(task.dueDate)}
                    </p>
                    {dueDateOverdue && (
                      <span className="text-[10px] text-red-500 font-semibold uppercase tracking-wide mt-1 block">Overdue</span>
                    )}
                  </>
                ) : (
                  <>
                    <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Created</p>
                    <p className="text-sm text-slate-300">{formatDateTime(task.createdAt)}</p>
                    <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5 mt-3">Updated</p>
                    <p className="text-sm text-slate-300">{formatDateTime(task.updatedAt)}</p>
                  </>
                )}
              </div>
            </div>

            {/* Epic (if set) */}
            {epic && (
              <div className="rounded-xl border border-[#1e2a3d] bg-[#161d2e] p-4">
                <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Layers size={10} /> Epic
                </p>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: epic.color }} />
                  <span className="text-sm text-slate-200 font-medium">{epic.name}</span>
                </div>
                {epic.description && (
                  <p className="text-xs text-slate-500 mt-1">{epic.description}</p>
                )}
              </div>
            )}

            {/* Working Dir */}
            <div className="rounded-xl border border-[#1e2a3d] bg-[#161d2e] p-4">
              <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-2">Working Dir</p>
              <div className="flex items-center gap-2">
                <FolderOpen size={14} className="text-slate-500" />
                <span className="text-sm font-mono text-slate-400">{task.workingDirectory || "~"}</span>
              </div>
            </div>

            {/* Description */}
            <div>
              <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-2">Description</p>
              <div className="rounded-xl border border-[#1e2a3d] bg-[#161d2e] px-4 py-3">
                <p className="text-sm text-slate-300 leading-relaxed">
                  {task.description || <span className="text-slate-600 italic">No description provided.</span>}
                </p>
              </div>
            </div>

            {/* Checklist */}
            {checklist.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                    Checklist
                  </p>
                  <span className="text-[11px] text-slate-500">
                    {checklist.filter(i => i.done).length}/{checklist.length}
                  </span>
                </div>
                {/* Progress bar */}
                <div className="h-1 w-full bg-[#2d3748] rounded-full overflow-hidden mb-3">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all"
                    style={{ width: `${Math.round((checklist.filter(i => i.done).length / checklist.length) * 100)}%` }}
                  />
                </div>
                <div className="rounded-xl border border-[#1e2a3d] bg-[#161d2e] p-4 space-y-2">
                  {checklist.map((item) => (
                    <label
                      key={item.id}
                      className="flex items-start gap-3 cursor-pointer group"
                    >
                      <input
                        type="checkbox"
                        checked={item.done}
                        onChange={(e) => toggleChecklistItem(item.id, e.target.checked)}
                        className="mt-0.5 w-4 h-4 rounded border-[#3d4f6e] bg-[#1e2535] text-blue-500 accent-blue-500 cursor-pointer shrink-0"
                      />
                      <span className={`text-sm leading-relaxed transition-colors ${
                        item.done
                          ? "text-slate-600 line-through"
                          : "text-slate-300 group-hover:text-slate-200"
                      }`}>
                        {item.title}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Activity / Comments */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare size={14} className="text-slate-600" />
                <h3 className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">Activity</h3>
              </div>
              <CommentList taskId={task.id} />
              <CommentForm taskId={task.id} />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <TaskFormDialog open={isEditOpen} onOpenChange={setIsEditOpen} task={task} boardSlug={boardSlug} />
      <DeleteTaskDialog
        taskId={task.id}
        taskTitle={task.title}
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onDeleted={() => onOpenChange(false)}
        boardSlug={boardSlug}
      />
    </>
  );
}
