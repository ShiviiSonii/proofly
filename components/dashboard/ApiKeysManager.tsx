"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ApiKeyItem = {
  id: string;
  name: string;
  createdAt: string;
  lastUsedAt: string | null;
  revoked: boolean;
};

type ApiKeysManagerProps = {
  projectId: string;
  initialKeys: ApiKeyItem[];
};

function formatDate(dateString: string | null) {
  if (!dateString) return "Never";
  return new Date(dateString).toLocaleString();
}

export function ApiKeysManager({ projectId, initialKeys }: ApiKeysManagerProps) {
  const [keys, setKeys] = useState<ApiKeyItem[]>(initialKeys);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isRevokeOpen, setIsRevokeOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState<ApiKeyItem | null>(null);

  const [createName, setCreateName] = useState("");
  const [newToken, setNewToken] = useState<string | null>(null);

  async function refreshKeys() {
    const res = await fetch(`/api/projects/${projectId}/api-keys`);
    if (!res.ok) {
      throw new Error("Failed to load API keys.");
    }
    const data = (await res.json()) as ApiKeyItem[];
    setKeys(data);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!createName.trim()) {
      setError("API key name is required.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/projects/${projectId}/api-keys`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: createName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create API key.");
        return;
      }

      setNewToken(data.token);
      setCreateName("");
      setIsCreateOpen(false);
      await refreshKeys();
    } catch {
      setError("Failed to create API key.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRevoke() {
    if (!selectedKey) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/projects/${projectId}/api-keys/${selectedKey.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to revoke API key.");
        return;
      }

      setIsRevokeOpen(false);
      setSelectedKey(null);
      await refreshKeys();
    } catch {
      setError("Failed to revoke API key.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">API Keys</h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Create and manage keys for programmatic access.
          </p>
        </div>
        <Button type="button" onClick={() => setIsCreateOpen(true)}>
          Create API key
        </Button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {newToken && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-900/20">
          <p className="text-sm font-medium text-green-800 dark:text-green-400">
            API key created. Copy it now — it will not be shown again.
          </p>
          <code className="mt-2 block break-all rounded-md bg-white px-3 py-2 text-xs text-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
            {newToken}
          </code>
          <div className="mt-2 flex justify-end gap-2">
            <Button
              type="button"
              onClick={async () => {
                await navigator.clipboard.writeText(newToken);
              }}
              size="sm"
            >
              Copy key
            </Button>
            <Button
              type="button"
              onClick={() => setNewToken(null)}
              variant="outline"
              size="sm"
            >
              Done
            </Button>
          </div>
        </div>
      )}

      {keys.length === 0 ? (
        <p className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
          No API keys yet.
        </p>
      ) : (
        <div className="space-y-3">
          {keys.map((key) => (
            <Card key={key.id}>
              <CardContent>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-zinc-900 text-md tracking-wide dark:text-zinc-50">{key.name}</p>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    Created: {formatDate(key.createdAt)}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    Last used: {formatDate(key.lastUsedAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={key.revoked ? "destructive" : "default"}>
                    {key.revoked ? "Revoked" : "Active"}
                  </Badge>
                  {!key.revoked && (
                    <Button
                      type="button"
                      onClick={() => {
                        setSelectedKey(key);
                        setIsRevokeOpen(true);
                      }}
                      variant="destructive"
                      size="sm"
                    >
                      Revoke
                    </Button>
                  )}
                </div>
              </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {isCreateOpen && (
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create API key</DialogTitle>
              <DialogDescription>Create a new key for this project.</DialogDescription>
            </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="api-key-name">Key name</Label>
              <Input
                id="api-key-name"
                type="text"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                required
                disabled={loading}
                placeholder="e.g. Marketing website"
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreateOpen(false);
                  setCreateName("");
                }}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </form>
          </DialogContent>
        </Dialog>
      )}

      {isRevokeOpen && selectedKey && (
        <Dialog open={isRevokeOpen} onOpenChange={setIsRevokeOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Revoke API key</DialogTitle>
              <DialogDescription>
                Revoke <strong>{selectedKey.name}</strong>? It will stop working immediately.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsRevokeOpen(false);
                  setSelectedKey(null);
                }}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleRevoke}
                disabled={loading}
              >
                {loading ? "Revoking..." : "Revoke key"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
