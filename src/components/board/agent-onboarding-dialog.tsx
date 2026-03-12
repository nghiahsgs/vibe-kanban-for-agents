"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { generateAgentPrompt, type AgentType } from "@/lib/prompt-templates";
import type { Board } from "@/types";
import { toast } from "sonner";
import { Copy, RefreshCw, User, Plug, FileText, Bot, Circle, Trash2 } from "lucide-react";
import { useRegenerateKey } from "@/hooks/use-boards";
import { useAgents, useCreateAgent, useDeleteAgent } from "@/hooks/use-agents";

interface AgentOnboardingDialogProps {
  board: Board;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  boardSlug?: string;
}

export function AgentOnboardingDialog({ board, open, onOpenChange, boardSlug }: AgentOnboardingDialogProps) {
  const regenerateKey = useRegenerateKey();
  const { data: agents = [] } = useAgents(boardSlug || board.slug);
  const createAgent = useCreateAgent(boardSlug || board.slug);
  const deleteAgent = useDeleteAgent(boardSlug || board.slug);

  const [agentName, setAgentName] = useState("claude-agent");
  const [agentType, setAgentType] = useState<AgentType>("claude-code");
  const [kanbanUrl, setKanbanUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [activeTab, setActiveTab] = useState<"agents" | "onboard">("agents");

  useEffect(() => {
    if (open && typeof window !== "undefined") {
      setKanbanUrl(window.location.origin);
    }
  }, [open]);

  const prompt = generateAgentPrompt(agentType, {
    boardName: board.name,
    boardSlug: board.slug,
    kanbanUrl,
    agentName,
    apiKey,
  });

  function handleCopyAndCreate() {
    navigator.clipboard.writeText(prompt);

    // Create agent in DB if name doesn't already exist
    const exists = agents.some((a) => a.name === agentName.trim());
    if (!exists && agentName.trim()) {
      createAgent.mutate(
        { name: agentName.trim(), type: agentType },
        {
          onSuccess: () => toast.success("Prompt copied & agent created"),
          onError: (err) => {
            toast.success("Prompt copied");
            if (!String(err).includes("already exists")) {
              toast.error("Failed to create agent");
            }
          },
        }
      );
    } else {
      toast.success("Prompt copied to clipboard");
    }
  }

  function handleRegenerate() {
    regenerateKey.mutate(board.slug, {
      onSuccess: (data) => {
        setApiKey(data.apiKey);
        toast.success("API key regenerated — save it now");
      },
      onError: () => toast.error("Failed to regenerate key"),
    });
  }

  function handleDeleteAgent(agentId: string) {
    deleteAgent.mutate(agentId, {
      onSuccess: () => toast.success("Agent removed"),
      onError: () => toast.error("Failed to remove agent"),
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Agent Management</DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">View active agents or onboard a new one</p>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-lg bg-muted/50 mt-2">
          <button
            onClick={() => setActiveTab("agents")}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeTab === "agents"
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Bot className="h-3.5 w-3.5" />
            Agents ({agents.length})
          </button>
          <button
            onClick={() => setActiveTab("onboard")}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeTab === "onboard"
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Plug className="h-3.5 w-3.5" />
            Onboard New
          </button>
        </div>

        {/* Tab: Agents List */}
        {activeTab === "agents" && (
          <div className="space-y-3 mt-2">
            {agents.length === 0 ? (
              <div className="py-10 text-center">
                <div className="mx-auto w-12 h-12 rounded-xl bg-muted/80 dark:bg-white/[0.06] flex items-center justify-center mb-3">
                  <Bot className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">No agents yet</p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  Onboard your first agent to get started
                </p>
                <Button
                  size="sm"
                  className="mt-4 h-8 gap-1.5 text-xs bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white border-0"
                  onClick={() => setActiveTab("onboard")}
                >
                  <Plug className="h-3.5 w-3.5" />
                  Onboard Agent
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-border/40">
                {agents.map((agent) => (
                  <div key={agent.id} className="flex items-center justify-between py-3 first:pt-0">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{agent.name}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Circle className="h-2 w-2 fill-emerald-500 text-emerald-500" />
                          <span className="text-xs text-muted-foreground">{agent.type}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => {
                          setAgentName(agent.name);
                          setAgentType(agent.type as AgentType);
                          setActiveTab("onboard");
                        }}
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Get Prompt
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDeleteAgent(agent.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: Onboard New Agent */}
        {activeTab === "onboard" && (
          <div className="space-y-6 mt-2">
            {/* Section 1: Agent Identity */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground/80">
                <User className="h-4 w-4 text-primary" />
                Agent Identity
              </div>
              <div className="grid grid-cols-2 gap-3 pl-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Agent Name</label>
                  <Input
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    placeholder="claude-agent"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Agent Type</label>
                  <Select value={agentType} onValueChange={(v) => setAgentType(v as AgentType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="claude-code">Claude Code</SelectItem>
                      <SelectItem value="cursor">Cursor</SelectItem>
                      <SelectItem value="generic">Generic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Section 2: Connection */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground/80">
                <Plug className="h-4 w-4 text-primary" />
                Connection
              </div>
              <div className="space-y-3 pl-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Kanban URL</label>
                  <Input
                    value={kanbanUrl}
                    onChange={(e) => setKanbanUrl(e.target.value)}
                    placeholder="http://localhost:3001"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">API Key</label>
                  <div className="flex gap-2">
                    <Input
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder={board.keyPrefix ? `${board.keyPrefix}••••` : "Paste API key or regenerate"}
                      className="font-mono text-xs"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="shrink-0"
                      onClick={handleRegenerate}
                      disabled={regenerateKey.isPending}
                      title="Regenerate API key"
                    >
                      <RefreshCw className={`h-4 w-4 ${regenerateKey.isPending ? "animate-spin" : ""}`} />
                    </Button>
                  </div>
                  {!apiKey && (
                    <p className="text-[11px] text-amber-600 dark:text-amber-400">
                      {board.keyPrefix
                        ? "Click refresh to regenerate a new key (replaces old one)"
                        : "No API key set — click refresh to generate one"}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Section 3: Generated Prompt */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground/80">
                  <FileText className="h-4 w-4 text-primary" />
                  Generated Prompt
                </div>
                <Button
                  type="button"
                  size="sm"
                  className="h-7 gap-1.5 text-xs bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white border-0"
                  onClick={handleCopyAndCreate}
                  disabled={!agentName.trim() || createAgent.isPending}
                >
                  <Copy className="h-3.5 w-3.5" />
                  {agents.some((a) => a.name === agentName.trim()) ? "Copy Prompt" : "Copy & Create Agent"}
                </Button>
              </div>
              <div className="pl-6">
                <textarea
                  readOnly
                  value={prompt}
                  className="w-full min-h-[280px] rounded-lg border border-border/60 bg-muted/40 dark:bg-black/20 p-3 text-xs font-mono leading-relaxed resize-y focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
