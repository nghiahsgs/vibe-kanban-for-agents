"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Agent, AgentType } from "@/types";

async function fetchAgents(boardSlug: string): Promise<Agent[]> {
  const res = await fetch(`/api/boards/${boardSlug}/agents`);
  if (!res.ok) throw new Error("Failed to fetch agents");
  const data = await res.json();
  return data.agents;
}

export function useAgents(boardSlug?: string) {
  return useQuery({
    queryKey: ["agents", boardSlug],
    queryFn: () => fetchAgents(boardSlug!),
    enabled: !!boardSlug,
  });
}

export function useCreateAgent(boardSlug?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: { name: string; type?: AgentType }) => {
      const res = await fetch(`/api/boards/${boardSlug}/agents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.detail || "Failed to create agent");
      }
      return res.json() as Promise<Agent>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents", boardSlug] });
    },
  });
}

export function useDeleteAgent(boardSlug?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (agentId: string) => {
      const res = await fetch(`/api/boards/${boardSlug}/agents/${agentId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete agent");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents", boardSlug] });
    },
  });
}
