"use client";

import { useComments } from "@/hooks/use-comments";
import { formatRelativeTime } from "@/lib/format-time";
import { renderMarkdown } from "@/lib/simple-markdown";

interface CommentListProps {
  taskId: string;
}

function getInitialsColor(name: string): string {
  const colors = [
    "bg-blue-500",
    "bg-violet-500",
    "bg-emerald-500",
    "bg-amber-500",
    "bg-rose-500",
    "bg-cyan-500",
    "bg-pink-500",
    "bg-indigo-500",
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function CommentList({ taskId }: CommentListProps) {
  const { data: comments, isLoading } = useComments(taskId);

  if (isLoading) {
    return <p className="text-xs text-muted-foreground py-2">Loading comments...</p>;
  }

  if (!comments || comments.length === 0) {
    return (
      <div className="py-6 text-center">
        <p className="text-sm text-muted-foreground">No activity yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-h-64 overflow-y-auto">
      {comments.map((comment) => (
        <div key={comment.id} className="flex gap-3">
          {/* Avatar */}
          <div
            className={`h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0 ${getInitialsColor(comment.author)}`}
          >
            {getInitials(comment.author)}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium leading-none">{comment.author}</span>
              <span className="text-xs text-muted-foreground">
                {formatRelativeTime(comment.createdAt)}
              </span>
            </div>
            <div className="text-sm text-foreground leading-relaxed">{renderMarkdown(comment.content)}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
