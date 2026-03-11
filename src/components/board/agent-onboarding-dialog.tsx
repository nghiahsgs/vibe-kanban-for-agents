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
import { Copy, RefreshCw } from "lucide-react";
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
          <DialogTitle>Agent Onboarding</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Agent Name</label>
              <Input
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                placeholder="claude-agent"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Agent Type</label>
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

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Kanban URL</label>
            <Input
              value={kanbanUrl}
              onChange={(e) => setKanbanUrl(e.target.value)}
              placeholder="http://localhost:3001"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">API Key</label>
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
              <p className="text-xs text-amber-600 dark:text-amber-400">
                {board.keyPrefix
                  ? "Click 🔄 to regenerate a new key (the old one will be replaced)"
                  : "No API key set — click 🔄 to generate one"}
              </p>
            )}
          </div>

          {/* Generated prompt */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Generated Prompt</label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-7 gap-1.5 text-xs"
                onClick={handleCopy}
              >
                <Copy className="h-3.5 w-3.5" />
                Copy
              </Button>
            </div>
            <textarea
              readOnly
              value={prompt}
              className="w-full min-h-[300px] rounded-md border bg-muted/40 p-3 text-xs font-mono resize-y focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
