"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateBoard } from "@/hooks/use-boards";
import { toast } from "sonner";

interface BoardCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BoardCreateDialog({ open, onOpenChange }: BoardCreateDialogProps) {
  const router = useRouter();
  const createBoard = useCreateBoard();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [generateKey, setGenerateKey] = useState(false);
  const [newApiKey, setNewApiKey] = useState<string | null>(null);
  const [newSlug, setNewSlug] = useState<string | null>(null);

  function handleClose() {
    setName("");
    setDescription("");
    setGenerateKey(false);
    setNewApiKey(null);
    setNewSlug(null);
    onOpenChange(false);
  }

  function handleNavigate() {
    if (newSlug) router.push(`/boards/${newSlug}`);
    handleClose();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    createBoard.mutate(
      {
        name: name.trim(),
        description: description.trim() || undefined,
        generateKey,
      },
      {
        onSuccess: (data) => {
          if (data.apiKey) {
            setNewApiKey(data.apiKey);
            setNewSlug(data.slug);
          } else {
            toast.success("Board created");
            router.push(`/boards/${data.slug}`);
            handleClose();
          }
        },
        onError: () => toast.error("Failed to create board"),
      }
    );
  }

  // Show API key reveal step
  if (newApiKey && newSlug) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Board Created</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="rounded-md border border-status-review/40 bg-status-review-bg p-4 space-y-2">
              <p className="text-sm font-semibold text-status-review-text">
                Save your API key now — it will not be shown again.
              </p>
              <code className="block text-xs font-mono break-all bg-surface-sunken p-2 rounded select-all">
                {newApiKey}
              </code>
            </div>
            <Button
              className="w-full"
              onClick={() => {
                navigator.clipboard.writeText(newApiKey);
                toast.success("API key copied to clipboard");
              }}
              variant="outline"
            >
              Copy API Key
            </Button>
            <Button className="w-full" onClick={handleNavigate}>
              Go to Board
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Board</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-1.5">
            <label htmlFor="board-name" className="text-sm font-medium">
              Name <span className="text-destructive">*</span>
            </label>
            <Input
              id="board-name"
              placeholder="My Project Board"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="board-description" className="text-sm font-medium">
              Description
            </label>
            <Input
              id="board-description"
              placeholder="Optional description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={generateKey}
              onChange={(e) => setGenerateKey(e.target.checked)}
              className="h-4 w-4 rounded border-border accent-primary"
            />
            <span className="text-sm">Generate API key for agents</span>
          </label>

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createBoard.isPending || !name.trim()}>
              {createBoard.isPending ? "Creating..." : "Create Board"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
