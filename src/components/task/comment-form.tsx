"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useCreateComment } from "@/hooks/use-comments";

interface CommentFormProps {
  taskId: string;
}

export function CommentForm({ taskId }: CommentFormProps) {
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
  const createComment = useCreateComment(taskId);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!author.trim() || !content.trim()) return;

    createComment.mutate(
      { author: author.trim(), content: content.trim() },
      {
        onSuccess: () => {
          setContent("");
        },
      }
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2 pt-2">
      {/* Author name — only show if not set */}
      {!author && (
        <Input
          placeholder="Your name"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          className="text-sm h-8"
        />
      )}
      <div className="flex items-center gap-2">
        <input
          placeholder="Add a comment..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(e); } }}
          className="flex-1 px-3.5 py-2.5 bg-[#1a2236] border border-[#2d3748] rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
        />
        <button
          type="submit"
          disabled={createComment.isPending || !author.trim() || !content.trim()}
          className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
        >
          Send
        </button>
      </div>
    </form>
  );
}
