"use client";

import { Loader2 } from "lucide-react";
import { useComments } from "@/hooks/use-comments";
import { formatRelativeTime } from "@/lib/format-time";
import { renderMarkdown } from "@/lib/simple-markdown";

interface CommentListProps {
  taskId: string;
}

const AVATAR_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4"];

function getAvatarColor(name: string) {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}

function getInitials(name: string) {
  return name.split(/[\s-]/).slice(0, 2).map(p => p[0]?.toUpperCase() ?? "").join("") || name.slice(0, 2).toUpperCase();
}

export function CommentList({ taskId }: CommentListProps) {
  const { data: comments, isLoading } = useComments(taskId);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-3 text-slate-500">
        <Loader2 size={14} className="animate-spin" />
        <span className="text-xs">Loading comments...</span>
      </div>
    );
  }

  if (!comments || comments.length === 0) {
    return (
      <div className="py-4 text-center">
        <p className="text-xs text-slate-600">No activity yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-64 overflow-y-auto" role="list" aria-label="Comments">
      {comments.map((comment) => (
        <div key={comment.id} className="flex gap-3" role="listitem">
          <div
            className="h-7 w-7 rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0"
            style={{ backgroundColor: getAvatarColor(comment.author) }}
          >
            {getInitials(comment.author)}
          </div>
          <div className="flex-1 min-w-0 space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-200 leading-none">{comment.author}</span>
              <span className="text-[11px] text-slate-600">{formatRelativeTime(comment.createdAt)}</span>
            </div>
            <div className="text-sm text-slate-400 leading-relaxed">{renderMarkdown(comment.content)}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
