"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Board } from "@/types";

async function fetchBoards(): Promise<Board[]> {
  const res = await fetch("/api/boards");
  if (!res.ok) throw new Error("Failed to fetch boards");
  const data = await res.json();
  return data.boards;
}

async function fetchBoard(slug: string): Promise<Board> {
  const res = await fetch(`/api/boards/${slug}`);
  if (!res.ok) throw new Error("Failed to fetch board");
  return res.json();
}

export function useBoards() {
  return useQuery({ queryKey: ["boards"], queryFn: fetchBoards });
}

export function useBoard(slug: string) {
  return useQuery({
    queryKey: ["boards", slug],
    queryFn: () => fetchBoard(slug),
    enabled: !!slug,
  });
}

export function useCreateBoard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: {
      name: string;
      description?: string;
      generateKey?: boolean;
    }) => {
      const res = await fetch("/api/boards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to create board");
      return res.json() as Promise<Board & { apiKey?: string }>;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["boards"] }),
  });
}

export function useUpdateBoard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      slug,
      ...updates
    }: {
      slug: string;
      name?: string;
      description?: string;
    }) => {
      const res = await fetch(`/api/boards/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Failed to update board");
      return res.json() as Promise<Board>;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["boards"] }),
  });
}

export function useDeleteBoard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (slug: string) => {
      const res = await fetch(`/api/boards/${slug}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.detail || "Failed to delete board");
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["boards"] }),
  });
}

export function useRegenerateKey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (slug: string) => {
      const res = await fetch(`/api/boards/${slug}/regenerate-key`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to regenerate key");
      return res.json() as Promise<{ apiKey: string; keyPrefix: string }>;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["boards"] }),
  });
}
