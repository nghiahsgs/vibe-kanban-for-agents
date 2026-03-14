"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import type { Task } from "@/types";

async function fetchTasks(boardSlug?: string): Promise<Task[]> {
  const url = boardSlug
    ? `/api/boards/${boardSlug}/tasks`
    : "/api/tasks";
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch tasks");
  const data = await res.json();
  return data.tasks;
}

export function useTasks(boardSlug?: string) {
  return useQuery({
    queryKey: boardSlug ? ["tasks", boardSlug] : ["tasks"],
    queryFn: () => fetchTasks(boardSlug),
    refetchInterval: 5000,
  });
}

export function useCreateTask(boardSlug?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: {
      title: string;
      description?: string;
      status?: string;
      assignee?: string;
      priority?: string;
      workingDirectory?: string;
      labels?: string;
      dueDate?: string;
      checklist?: string;
      epicId?: string;
      parentId?: string;
    }) => {
      const url = boardSlug
        ? `/api/boards/${boardSlug}/tasks`
        : "/api/tasks";
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to create task");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: boardSlug ? ["tasks", boardSlug] : ["tasks"],
      });
    },
  });
}

export function useUpdateTask(boardSlug?: string) {
  const queryClient = useQueryClient();
  const queryKey = boardSlug ? ["tasks", boardSlug] : ["tasks"];

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<Task> & { id: string }) => {
      const url = boardSlug
        ? `/api/boards/${boardSlug}/tasks/${id}`
        : `/api/tasks/${id}`;
      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Failed to update task");
      return res.json();
    },
    /* Optimistic update — move card instantly, rollback on error */
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<Task[]>(queryKey);
      queryClient.setQueryData<Task[]>(queryKey, (old) =>
        old?.map((t) =>
          t.id === variables.id ? { ...t, ...variables, updatedAt: new Date().toISOString() } : t
        )
      );
      return { previous };
    },
    onError: (_err, _variables, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}

export function useDeleteTask(boardSlug?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const url = boardSlug
        ? `/api/boards/${boardSlug}/tasks/${id}`
        : `/api/tasks/${id}`;
      const res = await fetch(url, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete task");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: boardSlug ? ["tasks", boardSlug] : ["tasks"],
      });
    },
  });
}
