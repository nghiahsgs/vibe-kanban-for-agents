"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Pencil, Trash2, X, User, FolderOpen, MessageSquare } from "lucide-react";
import { TaskFormDialog } from "./task-form-dialog";
import { DeleteTaskDialog } from "./delete-task-dialog";
import { CommentList } from "./comment-list";
import { CommentForm } from "./comment-form";
import type { Task } from "@/types";

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

interface TaskDetailDialogProps {
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  boardSlug?: string;
}

export function TaskDetailDialog({ task, open, onOpenChange, boardSlug }: TaskDetailDialogProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const pCfg = priorityConfig[task.priority] || priorityConfig.medium;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent showCloseButton={false} className="sm:max-w-2xl max-h-[85vh] overflow-y-auto p-0">
          {/* Header — title + action icons */}
          <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[#1e2a3d]">
            <h2 className="text-lg font-bold text-slate-100 leading-snug break-words pr-4">
              {task.title}
            </h2>
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

            {/* Assignee + Dates row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-[#1e2a3d] bg-[#161d2e] p-4">
                <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-2">Assignee</p>
                <div className="flex items-center gap-2">
                  <User size={14} className="text-slate-500" />
                  <span className="text-sm text-slate-200">{task.assignee || "Unassigned"}</span>
                </div>
              </div>
              <div className="rounded-xl border border-[#1e2a3d] bg-[#161d2e] p-4">
                <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Created</p>
                <p className="text-sm text-slate-300">{formatDateTime(task.createdAt)}</p>
                <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5 mt-3">Updated</p>
                <p className="text-sm text-slate-300">{formatDateTime(task.updatedAt)}</p>
              </div>
            </div>

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
