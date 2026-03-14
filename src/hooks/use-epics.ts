"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Epic } from "@/types";

async function fetchEpics(boardSlug: string): Promise<Epic[]> {
  const res = await fetch(`/api/boards/${boardSlug}/epics`);
  if (!res.ok) throw new Error("Failed to fetch epics");
  const data = await res.json();
  return data.epics;
}

export function useEpics(boardSlug?: string) {
  return useQuery({
    queryKey: ["epics", boardSlug],
    queryFn: () => fetchEpics(boardSlug!),
    enabled: !!boardSlug,
  });
}

export function useCreateEpic(boardSlug?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: {
      name: string;
      description?: string;
      color?: string;
    }) => {
      const res = await fetch(`/api/boards/${boardSlug}/epics`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to create epic");
      return res.json() as Promise<Epic>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["epics", boardSlug] });
    },
  });
}
