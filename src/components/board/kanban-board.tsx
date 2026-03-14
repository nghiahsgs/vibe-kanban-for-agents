"use client";

import { useState, useMemo } from "react";
import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import { useTasks, useUpdateTask } from "@/hooks/use-tasks";
import { useBoard } from "@/hooks/use-boards";
import { BoardColumn } from "./board-column";
import { BoardHeader } from "./board-header";
import { BoardSkeleton } from "./board-skeleton";
import { TaskFormDialog } from "@/components/task/task-form-dialog";
import { TaskDetailDialog } from "@/components/task/task-detail-dialog";
import { COLUMNS, type TaskStatus } from "@/types";
import { calculateMidPosition } from "@/lib/position-client";
import { toast } from "sonner";

interface KanbanBoardProps {
  boardSlug?: string;
}

export function KanbanBoard({ boardSlug }: KanbanBoardProps) {
  const { data: tasks, isLoading } = useTasks(boardSlug);
  const { data: board } = useBoard(boardSlug ?? "");
  const updateTask = useUpdateTask(boardSlug);

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [filterAssignee, setFilterAssignee] = useState<string | null>("all");

  // Extract unique assignees from tasks
  const assignees = useMemo(() => {
    if (!tasks) return [];
    const set = new Set(tasks.map((t) => t.assignee).filter(Boolean) as string[]);
    return Array.from(set).sort();
  }, [tasks]);

  // Filter tasks by assignee
  const filteredTasks = useMemo(() => {
    if (!tasks) return [];
    if (filterAssignee === "all") return tasks;
    return tasks.filter((t) => t.assignee === filterAssignee);
  }, [tasks, filterAssignee]);

  // Group tasks by status, sorted by position
  const groupedTasks = useMemo(() => {
    const groups: Record<TaskStatus, typeof filteredTasks> = {
      todo: [],
      in_progress: [],
      review: [],
      done: [],
    };
    for (const task of filteredTasks) {
      groups[task.status]?.push(task);
    }
    // Sort each group by position
    for (const key of Object.keys(groups) as TaskStatus[]) {
      groups[key].sort((a, b) => a.position - b.position);
    }
    return groups;
  }, [filteredTasks]);

  function handleDragEnd(result: DropResult) {
    const { draggableId, source, destination } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const newStatus = destination.droppableId as TaskStatus;
    const destTasks = [...groupedTasks[newStatus]];

    // If same column, remove dragged item from list first for correct position calc
    if (source.droppableId === destination.droppableId) {
      destTasks.splice(source.index, 1);
    }

    const before = destination.index > 0 ? destTasks[destination.index - 1]?.position ?? null : null;
    const after = destTasks[destination.index]?.position ?? null;
    const newPosition = calculateMidPosition(before, after);

    updateTask.mutate(
      { id: draggableId, status: newStatus, position: newPosition },
      {
        onError: () => toast.error("Failed to move task"),
      }
    );
  }

  if (isLoading) return <BoardSkeleton />;

  const selectedTask = tasks?.find((t) => t.id === selectedTaskId) ?? null;

  return (
    <>
      <BoardHeader
        onNewTask={() => setIsCreateOpen(true)}
        filterAssignee={filterAssignee}
        onFilterChange={setFilterAssignee}
        assignees={assignees}
        boardSlug={boardSlug}
        board={board ?? null}
      />

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-6 pt-1 px-1 min-h-0 flex-1 items-start snap-x snap-mandatory sm:snap-none">
          {COLUMNS.map((col) => (
            <BoardColumn
              key={col.id}
              status={col.id}
              label={col.label}
              tasks={groupedTasks[col.id]}
              onTaskClick={setSelectedTaskId}
            />
          ))}
        </div>
      </DragDropContext>

      <TaskFormDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        boardSlug={boardSlug}
      />

      {selectedTask && (
        <TaskDetailDialog
          task={selectedTask}
          open={!!selectedTaskId}
          onOpenChange={(open) => {
            if (!open) setSelectedTaskId(null);
          }}
          boardSlug={boardSlug}
        />
      )}
    </>
  );
}
