"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUpdateBoard, useDeleteBoard, useRegenerateKey } from "@/hooks/use-boards";
import type { Board } from "@/types";
import { toast } from "sonner";

interface BoardSettingsDialogProps {
  board: Board;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BoardSettingsDialog({ board, open, onOpenChange }: BoardSettingsDialogProps) {
  const router = useRouter();
  const updateBoard = useUpdateBoard();
  const deleteBoard = useDeleteBoard();
  const regenerateKey = useRegenerateKey();

  const [name, setName] = useState(board.name);
  const [description, setDescription] = useState(board.description || "");
  const [newApiKey, setNewApiKey] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (open) {
      setName(board.name);
      setDescription(board.description || "");
      setNewApiKey(null);
      setConfirmDelete(false);
    }
  }, [open, board]);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    updateBoard.mutate(
      { slug: board.slug, name: name.trim(), description: description.trim() || undefined },
      {
        onSuccess: () => {
          toast.success("Board updated");
          onOpenChange(false);
        },
        onError: () => toast.error("Failed to update board"),
      }
    );
  }

  function handleRegenerate() {
    regenerateKey.mutate(board.slug, {
      onSuccess: (data) => {
        setNewApiKey(data.apiKey);
        toast.success("API key regenerated");
      },
      onError: () => toast.error("Failed to regenerate key"),
    });
  }

  function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    deleteBoard.mutate(board.slug, {
      onSuccess: () => {
        toast.success("Board deleted");
        onOpenChange(false);
        router.push("/");
      },
      onError: (err) => toast.error(err.message || "Failed to delete board"),
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Board Settings</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <label htmlFor="settings-name" className="text-sm font-medium">
              Name <span className="text-destructive">*</span>
            </label>
            <Input
              id="settings-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="settings-description" className="text-sm font-medium">
              Description
            </label>
            <Input
              id="settings-description"
              placeholder="Optional description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* API Key section */}
          <div className="space-y-2 rounded-md border p-3">
            <p className="text-sm font-medium">API Key</p>
            {board.keyPrefix ? (
              <p className="text-xs text-muted-foreground font-mono">
                {board.keyPrefix}••••••••••••••••••••••••
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">No API key set</p>
            )}
            {newApiKey && (
              <div className="rounded border border-amber-500/40 bg-amber-500/10 p-2 space-y-1">
                <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold">
                  Save this key — it will not be shown again.
                </p>
                <code className="block text-xs font-mono break-all select-all">{newApiKey}</code>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="mt-1 h-7 text-xs"
                  onClick={() => {
                    navigator.clipboard.writeText(newApiKey);
                    toast.success("Copied");
                  }}
                >
                  Copy
                </Button>
              </div>
            )}
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8 text-xs"
              onClick={handleRegenerate}
              disabled={regenerateKey.isPending}
            >
              {regenerateKey.isPending ? "Generating..." : board.keyPrefix ? "Regenerate Key" : "Generate Key"}
            </Button>
          </div>

          <div className="flex justify-between gap-2 pt-1">
            <Button
              type="button"
              variant={confirmDelete ? "destructive" : "ghost"}
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={handleDelete}
              disabled={deleteBoard.isPending}
            >
              {deleteBoard.isPending
                ? "Deleting..."
                : confirmDelete
                ? "Confirm Delete"
                : "Delete Board"}
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateBoard.isPending || !name.trim()}>
                {updateBoard.isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
