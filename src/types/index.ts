export type TaskStatus = "todo" | "in_progress" | "review" | "done";
export type TaskPriority = "low" | "medium" | "high";

export interface Board {
  id: string;
  userId: string;
  name: string;
  slug: string;
  description: string | null;
  keyPrefix: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  boardId: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  assignee: string | null;
  priority: TaskPriority;
  position: number;
  workingDirectory: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  taskId: string;
  author: string;
  content: string;
  createdAt: string;
}

export type AgentType = "claude-code" | "cursor" | "generic";

export interface Agent {
  id: string;
  boardId: string;
  name: string;
  type: AgentType;
  createdAt: string;
}

export interface ApiError {
  type: string;
  title: string;
  detail: string;
  instance?: string;
}

export const COLUMNS: { id: TaskStatus; label: string }[] = [
  { id: "todo", label: "Todo" },
  { id: "in_progress", label: "In Progress" },
  { id: "review", label: "Review" },
  { id: "done", label: "Done" },
];
