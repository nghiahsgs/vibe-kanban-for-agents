"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { TaskFormDialog } from "./task-form-dialog";
import { DeleteTaskDialog } from "./delete-task-dialog";
import { CommentList } from "./comment-list";
import { CommentForm } from "./comment-form";
import type { Task } from "@/types";

const priorityColors: Record<string, string> = {
  high: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  low: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
};

const statusLabels: Record<string, string> = {
  todo: "Todo",
  in_progress: "In Progress",
  review: "Review",
  done: "Done",
};

interface TaskDetailDialogProps {
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  boardSlug?: string;
}

export function TaskDetailDialog({ task, open, onOpenChange, boardSlug }: TaskDetailDialogProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader className="space-y-0">
            <div className="flex items-start justify-between gap-4 pr-6">
              <DialogTitle className="text-xl font-semibold leading-snug break-words">
                {task.title}
              </DialogTitle>
              <div className="flex items-center gap-1 shrink-0 mt-0.5">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={() => setIsEditOpen(true)}
                  aria-label="Edit task"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => setIsDeleteOpen(true)}
                  aria-label="Delete task"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-5 mt-2">
            {/* Metadata grid */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium">Status</p>
                <Badge variant="secondary">{statusLabels[task.status]}</Badge>
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium">Priority</p>
                <Badge variant="outline" className={priorityColors[task.priority]}>
                  {task.priority}
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium">Assignee</p>
                <p className="text-sm">{task.assignee || <span className="text-muted-foreground">Unassigned</span>}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium">Created</p>
                <p className="text-sm text-muted-foreground">{new Date(task.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium">Updated</p>
                <p className="text-sm text-muted-foreground">{new Date(task.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium">Working Dir</p>
                <p className="text-sm font-mono text-muted-foreground truncate">
                  {task.workingDirectory || "~"}
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium">Description</p>
              <div className="rounded-md border bg-muted/30 px-4 py-3">
                <p className="text-sm leading-relaxed">
                  {task.description || <span className="text-muted-foreground italic">No description provided.</span>}
                </p>
              </div>
            </div>

            {/* Activity / Comments */}
            <div className="border-t" />
            <div className="space-y-3">
              <h3 className="text-xs uppercase tracking-wide text-muted-foreground font-medium">Activity</h3>
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
