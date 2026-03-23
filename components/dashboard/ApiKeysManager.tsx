"use client";

import { useState } from "react";

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

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl border border-zinc-200 bg-white p-5 shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-1 text-sm text-zinc-500 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
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
        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Create API key
        </button>
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
            <button
              type="button"
              onClick={async () => {
                await navigator.clipboard.writeText(newToken);
              }}
              className="rounded-md bg-green-700 px-3 py-2 text-xs font-medium text-white hover:bg-green-800"
            >
              Copy key
            </button>
            <button
              type="button"
              onClick={() => setNewToken(null)}
              className="rounded-md border border-green-300 px-3 py-2 text-xs font-medium text-green-700 hover:bg-green-100 dark:border-green-700 dark:text-green-300 dark:hover:bg-green-900/30"
            >
              Done
            </button>
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
            <div
              key={key.id}
              className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-zinc-900 dark:text-zinc-50">{key.name}</p>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    Created: {formatDate(key.createdAt)}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Last used: {formatDate(key.lastUsedAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded px-2 py-0.5 text-xs font-medium ${
                      key.revoked
                        ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"
                        : "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
                    }`}
                  >
                    {key.revoked ? "Revoked" : "Active"}
                  </span>
                  {!key.revoked && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedKey(key);
                        setIsRevokeOpen(true);
                      }}
                      className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-900/20"
                    >
                      Revoke
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isCreateOpen && (
        <Modal
          title="Create API key"
          onClose={() => {
            if (loading) return;
            setIsCreateOpen(false);
            setCreateName("");
          }}
        >
          <form onSubmit={handleCreate} className="space-y-3">
            <div>
              <label htmlFor="api-key-name" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Key name
              </label>
              <input
                id="api-key-name"
                type="text"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                required
                disabled={loading}
                placeholder="e.g. Marketing website"
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsCreateOpen(false);
                  setCreateName("");
                }}
                disabled={loading}
                className="rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                {loading ? "Creating..." : "Create"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {isRevokeOpen && selectedKey && (
        <Modal
          title="Revoke API key"
          onClose={() => {
            if (loading) return;
            setIsRevokeOpen(false);
            setSelectedKey(null);
          }}
        >
          <div className="space-y-4">
            <p className="text-sm text-zinc-700 dark:text-zinc-300">
              Revoke <strong>{selectedKey.name}</strong>? It will stop working immediately.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsRevokeOpen(false);
                  setSelectedKey(null);
                }}
                disabled={loading}
                className="rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRevoke}
                disabled={loading}
                className="rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                {loading ? "Revoking..." : "Revoke key"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
