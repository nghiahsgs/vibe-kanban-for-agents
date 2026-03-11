"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
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
    <form onSubmit={handleSubmit} className="space-y-2 mt-3">
      <Input
        placeholder="Your name"
        value={author}
        onChange={(e) => setAuthor(e.target.value)}
        className="text-sm"
      />
      <Textarea
        placeholder="Add a comment..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={2}
        className="text-sm"
      />
      <Button
        type="submit"
        size="sm"
        disabled={createComment.isPending || !author.trim() || !content.trim()}
      >
        {createComment.isPending ? "Posting..." : "Comment"}
      </Button>
    </form>
  );
}
