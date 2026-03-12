"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateTask, useUpdateTask } from "@/hooks/use-tasks";
import { useAgents } from "@/hooks/use-agents";
import { toast } from "sonner";
import type { Task } from "@/types";

interface TaskFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task | null; // If provided, edit mode
  boardSlug?: string;
}

export function TaskFormDialog({ open, onOpenChange, task, boardSlug }: TaskFormDialogProps) {
  const createTask = useCreateTask(boardSlug);
  const updateTask = useUpdateTask(boardSlug);
  const { data: agents = [] } = useAgents(boardSlug);
  const isEdit = !!task;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("todo");
  const [assignee, setAssignee] = useState("");
  const [priority, setPriority] = useState("medium");
  const [workingDirectory, setWorkingDirectory] = useState("");

  // Pre-fill form when editing
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setStatus(task.status);
      setAssignee(task.assignee || "");
      setPriority(task.priority);
      setWorkingDirectory(task.workingDirectory || "");
    } else {
      setTitle("");
      setDescription("");
      setStatus("todo");
      setAssignee("");
      setPriority("medium");
      setWorkingDirectory("");
    }
  }, [task, open]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    const body = {
      title: title.trim(),
      description: description.trim() || undefined,
      status: status as Task["status"],
      assignee: assignee.trim() || undefined,
      priority: priority as Task["priority"],
      workingDirectory: workingDirectory.trim() || undefined,
    };

    if (isEdit) {
      updateTask.mutate(
        { id: task!.id, ...body },
        {
          onSuccess: () => {
            toast.success("Task updated");
            onOpenChange(false);
          },
          onError: () => toast.error("Failed to update task"),
        }
      );
    } else {
      createTask.mutate(body, {
        onSuccess: () => {
          toast.success("Task created");
          onOpenChange(false);
        },
        onError: () => toast.error("Failed to create task"),
      });
    }
  }

  const isPending = createTask.isPending || updateTask.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Task" : "New Task"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 mt-3">
          {/* Title */}
          <div className="space-y-1.5">
            <label htmlFor="task-title" className="text-sm font-medium">
              Title <span className="text-destructive">*</span>
            </label>
            <Input
              id="task-title"
              placeholder="Enter task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label htmlFor="task-description" className="text-sm font-medium">
              Description
            </label>
            <Textarea
              id="task-description"
              placeholder="Add a description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Status + Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="task-status" className="text-sm font-medium">Status</label>
              <Select value={status} onValueChange={(v) => v && setStatus(v)}>
                <SelectTrigger id="task-status">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">Todo</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="task-priority" className="text-sm font-medium">Priority</label>
              <Select value={priority} onValueChange={(v) => v && setPriority(v)}>
                <SelectTrigger id="task-priority">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Assignee */}
          <div className="space-y-1.5">
            <label htmlFor="task-assignee" className="text-sm font-medium">Assignee</label>
            {agents.length > 0 ? (
              <Select value={assignee || "unassigned"} onValueChange={(v) => setAssignee(v === "unassigned" ? "" : (v ?? ""))}>
                <SelectTrigger id="task-assignee">
                  <SelectValue placeholder="Select agent" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {agents.map((a) => (
                    <SelectItem key={a.id} value={a.name}>{a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                id="task-assignee"
                placeholder="e.g. claude-agent (create agents in Agent Management)"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
              />
            )}
            <p className="text-xs text-muted-foreground">
              Create agents via Agents button in the header
            </p>
          </div>

          {/* Working Directory */}
          <div className="space-y-1.5">
            <label htmlFor="task-working-dir" className="text-sm font-medium">
              Working Directory
            </label>
            <Input
              id="task-working-dir"
              placeholder="/path/to/project (default: ~)"
              value={workingDirectory}
              onChange={(e) => setWorkingDirectory(e.target.value)}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending || !title.trim()}
              className="font-semibold"
            >
              {isPending ? "Saving..." : isEdit ? "Save changes" : "Create task"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
