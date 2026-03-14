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
import { useCreateTask, useUpdateTask, useTasks } from "@/hooks/use-tasks";
import { useAgents } from "@/hooks/use-agents";
import { useEpics } from "@/hooks/use-epics";
import { toast } from "sonner";
import { X, FileText, AlignLeft, Flag, User, FolderOpen, Tag, Calendar, Layers, GitBranch } from "lucide-react";
import type { Task, Label } from "@/types";

const PRIORITIES = [
  { value: "low", label: "Low", dot: "bg-green-500", color: "border-green-500/50 bg-green-500/10 text-green-400" },
  { value: "medium", label: "Medium", dot: "bg-amber-500", color: "border-amber-500/50 bg-amber-500/10 text-amber-400" },
  { value: "high", label: "High", dot: "bg-orange-500", color: "border-orange-500/50 bg-orange-500/10 text-orange-400" },
];

const LABEL_COLORS = [
  "#3b82f6", "#10b981", "#f59e0b", "#ef4444",
  "#ec4899", "#06b6d4", "#84cc16", "#f97316",
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
  const { data: epics = [] } = useEpics(boardSlug);
  const { data: allTasks = [] } = useTasks(boardSlug);
  const isEdit = !!task;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("todo");
  const [assignee, setAssignee] = useState("");
  const [priority, setPriority] = useState("medium");
  const [workingDirectory, setWorkingDirectory] = useState("");
  const [labels, setLabels] = useState<Label[]>([]);
  const [dueDate, setDueDate] = useState("");
  const [epicId, setEpicId] = useState("");
  const [parentId, setParentId] = useState("");

  // Label input state
  const [labelText, setLabelText] = useState("");
  const [labelColor, setLabelColor] = useState(LABEL_COLORS[0]);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setStatus(task.status);
      setAssignee(task.assignee || "");
      setPriority(task.priority);
      setWorkingDirectory(task.workingDirectory || "");
      setDueDate(task.dueDate ? task.dueDate.split("T")[0] : "");
      setEpicId(task.epicId || "");
      setParentId(task.parentId || "");
      try {
        setLabels(task.labels ? JSON.parse(task.labels) : []);
      } catch {
        setLabels([]);
      }
    } else {
      setTitle(""); setDescription(""); setStatus("todo");
      setAssignee(""); setPriority("medium"); setWorkingDirectory("");
      setDueDate(""); setEpicId(""); setParentId("");
      setLabels([]);
    }
    setLabelText("");
    setLabelColor(LABEL_COLORS[0]);
  }, [task, open]);

  function addLabel() {
    if (!labelText.trim()) return;
    setLabels(prev => [...prev, { text: labelText.trim(), color: labelColor }]);
    setLabelText("");
  }

  function removeLabel(idx: number) {
    setLabels(prev => prev.filter((_, i) => i !== idx));
  }

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
      labels: labels.length > 0 ? JSON.stringify(labels) : undefined,
      dueDate: dueDate || undefined,
      epicId: epicId || undefined,
      parentId: parentId || undefined,
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

  // Parent task options — exclude the current task itself
  const parentTaskOptions = allTasks.filter(t => !t.parentId && t.id !== task?.id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="sm:max-w-lg p-0 max-h-[90vh] overflow-y-auto">
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

          {/* Labels */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Tag size={11} /> Labels
            </label>

            {/* Existing labels as removable chips */}
            {labels.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {labels.map((label, i) => (
                  <span
                    key={i}
                    style={{ backgroundColor: label.color + "22", color: label.color, borderColor: label.color + "55" }}
                    className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide border"
                  >
                    {label.text}
                    <button
                      type="button"
                      onClick={() => removeLabel(i)}
                      className="ml-0.5 hover:opacity-70 transition-opacity"
                    >
                      <X size={9} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Add label row */}
            <div className="flex items-center gap-2">
              <Input
                placeholder="Label text..."
                value={labelText}
                onChange={(e) => setLabelText(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addLabel(); } }}
                className="flex-1 text-xs"
              />
              {/* Color dots */}
              <div className="flex gap-1 shrink-0">
                {LABEL_COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setLabelColor(c)}
                    className="w-4 h-4 rounded-full transition-transform"
                    style={{
                      backgroundColor: c,
                      outline: labelColor === c ? `2px solid ${c}` : "none",
                      outlineOffset: "2px",
                      transform: labelColor === c ? "scale(1.2)" : "scale(1)",
                    }}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={addLabel}
                className="px-2.5 py-1.5 bg-blue-600/20 text-blue-400 border border-blue-600/30 rounded-lg text-xs font-semibold hover:bg-blue-600/30 transition-colors shrink-0"
              >
                Add
              </button>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Calendar size={11} /> Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 bg-[#161d2e] border border-[#2d3748] rounded-xl text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 [color-scheme:dark]"
            />
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

          {/* Epic + Parent Task row */}
          <div className="grid grid-cols-2 gap-4">
            {epics.length > 0 && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Layers size={11} /> Epic
                </label>
                <Select value={epicId || "none"} onValueChange={(v) => setEpicId(v === "none" ? "" : (v ?? ""))}>
                  <SelectTrigger><SelectValue placeholder="Select epic" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {epics.map((ep) => (
                      <SelectItem key={ep.id} value={ep.id}>
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full shrink-0 inline-block" style={{ backgroundColor: ep.color }} />
                          {ep.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {parentTaskOptions.length > 0 && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <GitBranch size={11} /> Parent Task
                </label>
                <Select value={parentId || "none"} onValueChange={(v) => setParentId(v === "none" ? "" : (v ?? ""))}>
                  <SelectTrigger><SelectValue placeholder="Select parent" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {parentTaskOptions.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        <span className="truncate max-w-[140px] block">{t.title}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
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
