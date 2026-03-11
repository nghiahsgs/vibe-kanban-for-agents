"use client";

import { useComments } from "@/hooks/use-comments";

interface CommentListProps {
  taskId: string;
}

export function CommentList({ taskId }: CommentListProps) {
  const { data: comments, isLoading } = useComments(taskId);

  if (isLoading) return <p className="text-xs text-muted-foreground">Loading comments...</p>;

  if (!comments || comments.length === 0) {
    return <p className="text-xs text-muted-foreground py-2">No comments yet</p>;
  }

  return (
    <div className="space-y-3 max-h-48 overflow-y-auto">
      {comments.map((comment) => (
        <div key={comment.id} className="text-sm border-l-2 border-muted pl-3">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-medium text-xs">{comment.author}</span>
            <span className="text-xs text-muted-foreground">
              {new Date(comment.createdAt).toLocaleString()}
            </span>
          </div>
          <p className="text-sm text-foreground/80">{comment.content}</p>
        </div>
      ))}
    </div>
  );
}
