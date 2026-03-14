"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Copy, Trash2, Plus, Key, Check, AlertTriangle } from "lucide-react";

type ApiKey = {
  id: string;
  name: string;
  keyPrefix: string;
  lastUsedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
};

type CreatedKey = {
  id: string;
  name: string;
  key: string;
  prefix: string;
  expiresAt: string | null;
  createdAt: string;
};

export function ApiKeyManager() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyExpiresIn, setNewKeyExpiresIn] = useState("");
  const [creating, setCreating] = useState(false);
  const [createdKey, setCreatedKey] = useState<CreatedKey | null>(null);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchKeys = useCallback(async () => {
    try {
      const res = await fetch("/api/keys");
      if (!res.ok) throw new Error("Failed to fetch keys");
      const data = await res.json();
      setKeys(data.keys);
    } catch {
      setError("Failed to load API keys");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    setCreating(true);
    setError(null);
    try {
      const body: Record<string, string> = { name: newKeyName.trim() };
      if (newKeyExpiresIn) body.expiresIn = newKeyExpiresIn;

      const res = await fetch("/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to create key");
      }

      const created: CreatedKey = await res.json();
      setCreatedKey(created);
      setShowCreateForm(false);
      setNewKeyName("");
      setNewKeyExpiresIn("");
      await fetchKeys();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create key");
    } finally {
      setCreating(false);
    }
  }

  async function handleRevoke(id: string, name: string) {
    if (!confirm(`Revoke API key "${name}"? This cannot be undone.`)) return;

    setRevokingId(id);
    try {
      const res = await fetch(`/api/keys/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to revoke key");
      setKeys((prev) => prev.filter((k) => k.id !== id));
      if (createdKey?.id === id) setCreatedKey(null);
    } catch {
      setError("Failed to revoke key");
    } finally {
      setRevokingId(null);
    }
  }

  async function copyToClipboard(text: string, id: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKeyId(id);
      setTimeout(() => setCopiedKeyId(null), 2000);
    } catch {
      // Fallback for older browsers
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopiedKeyId(id);
      setTimeout(() => setCopiedKeyId(null), 2000);
    }
  }

  function formatDate(dateStr: string | null) {
    if (!dateStr) return "Never";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  function isExpired(expiresAt: string | null) {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  }

  return (
    <div className="space-y-6">
      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertTriangle className="size-4 shrink-0" />
          {error}
          <button
            className="ml-auto text-xs underline"
            onClick={() => setError(null)}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Newly created key display */}
      {createdKey && (
        <div className="rounded-lg border border-status-review/40 bg-status-review-bg p-4 space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-4 text-status-review-text shrink-0" />
            <p className="text-sm font-medium text-status-review-text">
              Save this key — it will only be shown once!
            </p>
          </div>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded border border-border bg-surface-sunken px-3 py-2 text-sm font-mono break-all">
              {createdKey.key}
            </code>
            <Button
              variant="outline"
              size="icon"
              onClick={() => copyToClipboard(createdKey.key, createdKey.id)}
              className="shrink-0"
            >
              {copiedKeyId === createdKey.id ? (
                <Check className="size-4 text-green-600" />
              ) : (
                <Copy className="size-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-status-review-text">
            Key <strong>{createdKey.name}</strong> created.
            {createdKey.expiresAt && ` Expires ${formatDate(createdKey.expiresAt)}.`}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCreatedKey(null)}
          >
            I have saved my key
          </Button>
        </div>
      )}

      {/* Create form */}
      {showCreateForm && (
        <Card className="p-4">
          <form onSubmit={handleCreate} className="space-y-4">
            <h3 className="text-sm font-semibold">Create new API key</h3>
            <div className="space-y-2">
              <Label htmlFor="key-name">Key name</Label>
              <Input
                id="key-name"
                placeholder="e.g. My AI Agent"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="key-expires">Expires in (days, optional)</Label>
              <Input
                id="key-expires"
                type="number"
                placeholder="e.g. 30 (leave blank for no expiry)"
                value={newKeyExpiresIn}
                onChange={(e) => setNewKeyExpiresIn(e.target.value)}
                min="1"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button type="submit" disabled={creating || !newKeyName.trim()}>
                {creating ? "Creating..." : "Create key"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowCreateForm(false);
                  setNewKeyName("");
                  setNewKeyExpiresIn("");
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Keys list */}
      <Card>
        <div className="flex items-center justify-between px-4 py-3">
          <h2 className="text-sm font-semibold">Your API keys</h2>
          {!showCreateForm && (
            <Button
              size="sm"
              onClick={() => setShowCreateForm(true)}
            >
              <Plus className="size-4" />
              New key
            </Button>
          )}
        </div>
        <Separator />
        {loading ? (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            Loading...
          </div>
        ) : keys.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-4 py-10 text-center">
            <Key className="size-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              No API keys yet. Create one to allow AI agents to access the board.
            </p>
            {!showCreateForm && (
              <Button size="sm" onClick={() => setShowCreateForm(true)}>
                <Plus className="size-4" />
                Create API key
              </Button>
            )}
          </div>
        ) : (
          <ul className="divide-y">
            {keys.map((key) => (
              <li key={key.id} className="flex items-center gap-3 px-4 py-3">
                <div className="flex-1 min-w-0 space-y-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium">{key.name}</span>
                    {isExpired(key.expiresAt) && (
                      <Badge variant="destructive" className="text-xs">Expired</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                    <span>
                      <code className="font-mono">{key.keyPrefix}…</code>
                    </span>
                    <span>Created {formatDate(key.createdAt)}</span>
                    <span>Last used: {formatDate(key.lastUsedAt)}</span>
                    {key.expiresAt && !isExpired(key.expiresAt) && (
                      <span>Expires {formatDate(key.expiresAt)}</span>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRevoke(key.id, key.name)}
                  disabled={revokingId === key.id}
                  className="shrink-0 text-destructive hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                  {revokingId === key.id ? "Revoking..." : "Revoke"}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Usage instructions */}
      <Card className="p-4 space-y-2">
        <h3 className="text-sm font-semibold">Using your API key</h3>
        <p className="text-sm text-muted-foreground">
          Include your API key in the <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">Authorization</code> header:
        </p>
        <code className="block text-xs font-mono bg-muted rounded px-3 py-2">
          Authorization: Bearer vk_your_key_here
        </code>
      </Card>
    </div>
  );
}
