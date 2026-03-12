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
import { Copy, RefreshCw, User, Plug, FileText } from "lucide-react";
import { useRegenerateKey } from "@/hooks/use-boards";

interface AgentOnboardingDialogProps {
  board: Board;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AgentOnboardingDialog({ board, open, onOpenChange }: AgentOnboardingDialogProps) {
  const regenerateKey = useRegenerateKey();

  const [agentName, setAgentName] = useState("claude-agent");
  const [agentType, setAgentType] = useState<AgentType>("claude-code");
  const [kanbanUrl, setKanbanUrl] = useState("");
  const [apiKey, setApiKey] = useState("");

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

  function handleCopy() {
    navigator.clipboard.writeText(prompt);
    toast.success("Prompt copied to clipboard");
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Agent Onboarding</DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">Configure and generate a prompt for your AI agent</p>
        </DialogHeader>

        <div className="space-y-6 mt-4">
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
                <p className="text-[11px] text-muted-foreground/70">
                  Assign tasks to <strong>&quot;{agentName || "claude-agent"}&quot;</strong> in the task form
                </p>
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
                onClick={handleCopy}
              >
                <Copy className="h-3.5 w-3.5" />
                Copy Prompt
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
      </DialogContent>
    </Dialog>
  );
}
