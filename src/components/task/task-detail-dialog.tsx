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
import { TaskFormDialog } from "./task-form-dialog";
import { DeleteTaskDialog } from "./delete-task-dialog";
import { CommentList } from "./comment-list";
import { CommentForm } from "./comment-form";
import type { Task } from "@/types";

const priorityColors: Record<string, string> = {
  high: "bg-red-100 text-red-800",
  medium: "bg-yellow-100 text-yellow-800",
  low: "bg-green-100 text-green-800",
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
}

export function TaskDetailDialog({ task, open, onOpenChange }: TaskDetailDialogProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 flex-wrap">
              <span className="break-all">{task.title}</span>
              <Badge variant="outline" className={priorityColors[task.priority]}>
                {task.priority}
              </Badge>
              <Badge variant="secondary">{statusLabels[task.status]}</Badge>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Description */}
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground mb-1">Description</h3>
              <p className="text-sm">{task.description || "No description"}</p>
            </div>

            {/* Metadata */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-xs font-semibold text-muted-foreground">Assignee</span>
                <p>{task.assignee || "Unassigned"}</p>
              </div>
              <div>
                <span className="text-xs font-semibold text-muted-foreground">Created</span>
                <p>{new Date(task.createdAt).toLocaleString()}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setIsEditOpen(true)}>
                Edit
              </Button>
              <Button size="sm" variant="destructive" onClick={() => setIsDeleteOpen(true)}>
                Delete
              </Button>
            </div>

            {/* Comments */}
            <div className="border-t pt-4">
              <h3 className="text-xs font-semibold text-muted-foreground mb-2">Activity</h3>
              <CommentList taskId={task.id} />
              <CommentForm taskId={task.id} />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <TaskFormDialog open={isEditOpen} onOpenChange={setIsEditOpen} task={task} />
      <DeleteTaskDialog
        taskId={task.id}
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onDeleted={() => onOpenChange(false)}
      />
    </>
  );
}
