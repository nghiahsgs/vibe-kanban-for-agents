"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
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
import { X, FileText, AlignLeft, Flag, User, FolderOpen } from "lucide-react";
import type { Task } from "@/types";

const PRIORITIES = [
  { value: "low", label: "Low", dot: "bg-green-500", color: "border-green-500/50 bg-green-500/10 text-green-400" },
  { value: "medium", label: "Medium", dot: "bg-amber-500", color: "border-amber-500/50 bg-amber-500/10 text-amber-400" },
  { value: "high", label: "High", dot: "bg-orange-500", color: "border-orange-500/50 bg-orange-500/10 text-orange-400" },
];

interface TaskFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task | null;
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

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setStatus(task.status);
      setAssignee(task.assignee || "");
      setPriority(task.priority);
      setWorkingDirectory(task.workingDirectory || "");
    } else {
      setTitle(""); setDescription(""); setStatus("todo");
      setAssignee(""); setPriority("medium"); setWorkingDirectory("");
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
      updateTask.mutate({ id: task!.id, ...body }, {
        onSuccess: () => { toast.success("Task updated"); onOpenChange(false); },
        onError: () => toast.error("Failed to update task"),
      });
    } else {
      createTask.mutate(body, {
        onSuccess: () => { toast.success("Task created"); onOpenChange(false); },
        onError: () => toast.error("Failed to create task"),
      });
    }
  }

  const isPending = createTask.isPending || updateTask.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="sm:max-w-lg p-0">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[#1e2a3d]">
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <FileText size={16} className="text-slate-500" />
            {isEdit ? "Edit Task" : "New Task"}
          </h2>
          <button
            onClick={() => onOpenChange(false)}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-500 hover:text-slate-300 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Title
            </label>
            <Input placeholder="Task title..." value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <AlignLeft size={11} /> Description
            </label>
            <Textarea placeholder="Add more context..." value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </div>

          {/* Priority selector — grid buttons like reference */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Flag size={11} /> Priority
            </label>
            <div className="grid grid-cols-3 gap-2">
              {PRIORITIES.map(p => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPriority(p.value)}
                  className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl border text-xs font-semibold transition-all ${
                    priority === p.value ? p.color + " scale-[1.02]" : "bg-white/5 border-white/10 text-slate-500 hover:border-white/20 hover:text-slate-400"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${p.dot}`} />
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Status + Assignee row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Status
              </label>
              <Select value={status} onValueChange={(v) => v && setStatus(v)}>
                <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">Todo</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <User size={11} /> Assignee
              </label>
              {agents.length > 0 ? (
                <Select value={assignee || "unassigned"} onValueChange={(v) => setAssignee(v === "unassigned" ? "" : (v ?? ""))}>
                  <SelectTrigger><SelectValue placeholder="Select agent" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {agents.map((a) => <SelectItem key={a.id} value={a.name}>{a.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              ) : (
                <Input placeholder="e.g. claude-agent" value={assignee} onChange={(e) => setAssignee(e.target.value)} />
              )}
            </div>
          </div>

          {/* Working Directory */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <FolderOpen size={11} /> Working Directory
            </label>
            <Input placeholder="/path/to/project (default: ~)" value={workingDirectory} onChange={(e) => setWorkingDirectory(e.target.value)} />
          </div>
        </form>

        {/* Footer buttons */}
        <div className="flex gap-3 px-6 pb-6">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="flex-1 py-2.5 px-4 bg-white/5 text-slate-400 rounded-xl text-sm font-medium hover:bg-white/10 hover:text-slate-300 transition-colors border border-white/10"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isPending || !title.trim()}
            className="flex-1 py-2.5 px-4 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isPending ? "Saving..." : isEdit ? "Save Changes" : "Create Task"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
