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
import { toast } from "sonner";
import type { Task } from "@/types";

interface TaskFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task | null; // If provided, edit mode
}

export function TaskFormDialog({ open, onOpenChange, task }: TaskFormDialogProps) {
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const isEdit = !!task;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("todo");
  const [assignee, setAssignee] = useState("");
  const [priority, setPriority] = useState("medium");

  // Pre-fill form when editing
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setStatus(task.status);
      setAssignee(task.assignee || "");
      setPriority(task.priority);
    } else {
      setTitle("");
      setDescription("");
      setStatus("todo");
      setAssignee("");
      setPriority("medium");
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input placeholder="Task title *" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <Textarea placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          <div className="grid grid-cols-2 gap-3">
            <Select value={status} onValueChange={(v) => v && setStatus(v)}>
              <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todo">Todo</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="review">Review</SelectItem>
                <SelectItem value="done">Done</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priority} onValueChange={(v) => v && setPriority(v)}>
              <SelectTrigger><SelectValue placeholder="Priority" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Input placeholder="Assignee (optional)" value={assignee} onChange={(e) => setAssignee(e.target.value)} />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isPending || !title.trim()}>
              {isPending ? "Saving..." : isEdit ? "Save" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
