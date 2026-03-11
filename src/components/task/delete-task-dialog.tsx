"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDeleteTask } from "@/hooks/use-tasks";
import { toast } from "sonner";

interface DeleteTaskDialogProps {
  taskId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted: () => void;
}

export function DeleteTaskDialog({ taskId, open, onOpenChange, onDeleted }: DeleteTaskDialogProps) {
  const deleteTask = useDeleteTask();

  function handleDelete() {
    deleteTask.mutate(taskId, {
      onSuccess: () => {
        toast.success("Task deleted");
        onOpenChange(false);
        onDeleted();
      },
      onError: () => toast.error("Failed to delete task"),
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete task?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the task and all its comments. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
