"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type ApiKey = {
  id: string;
  name: string;
  createdAt: string;
  lastUsedAt: string | null;
  revoked: boolean;
};

type ApiKeysSectionProps = {
  projectId: string;
};

export function ApiKeysSection({ projectId }: ApiKeysSectionProps) {
  const router = useRouter();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [creating, setCreating] = useState(false);
  const [newToken, setNewToken] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadKeys();
  }, [projectId]);

  async function loadKeys() {
    try {
      setLoading(true);
      const res = await fetch(`/api/projects/${projectId}/api-keys`);
      if (!res.ok) {
        setError("Failed to load API keys");
        return;
      }
      const data = await res.json();
      setKeys(data);
    } catch {
      setError("Failed to load API keys");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    if (!newKeyName.trim()) {
      setError("Name is required");
      return;
    }
    setCreating(true);
    setError("");
    try {
      const res = await fetch(`/api/projects/${projectId}/api-keys`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newKeyName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create API key");
        return;
      }
      setNewToken(data.token);
      setNewKeyName("");
      setShowCreateForm(false);
      loadKeys();
    } catch {
      setError("Failed to create API key");
    } finally {
      setCreating(false);
    }
  }

  async function handleRevoke(keyId: string) {
    if (!confirm("Are you sure you want to revoke this API key? It will stop working immediately.")) {
      return;
    }
    try {
      const res = await fetch(`/api/projects/${projectId}/api-keys/${keyId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        setError("Failed to revoke API key");
        return;
      }
      loadKeys();
    } catch {
      setError("Failed to revoke API key");
    }
  }

  function formatDate(dateString: string | null) {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString() + " " + new Date(dateString).toLocaleTimeString();
  }

  if (loading) {
    return (
      <div className="mt-10 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
        <p className="text-sm text-zinc-500">Loading API keys...</p>
      </div>
    );
  }

  return (
    <div className="mt-10 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">API Keys</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Create API keys to read testimonials programmatically. Use these keys in your own apps or websites.
          </p>
        </div>
        {!showCreateForm && (
          <button
            type="button"
            onClick={() => setShowCreateForm(true)}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Create API key
          </button>
        )}
      </div>

      {newToken && (
        <div className="mt-4 rounded-lg border-2 border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
          <p className="mb-2 text-sm font-medium text-green-800 dark:text-green-400">
            API key created! Copy it now — you won't be able to see it again.
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded bg-white px-3 py-2 text-sm font-mono text-green-900 dark:bg-zinc-900 dark:text-green-100">
              {newToken}
            </code>
            <button
              type="button"
              onClick={async () => {
                await navigator.clipboard.writeText(newToken);
                alert("Copied to clipboard!");
              }}
              className="rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700"
            >
              Copy
            </button>
            <button
              type="button"
              onClick={() => setNewToken(null)}
              className="rounded-lg border border-green-300 px-3 py-2 text-sm font-medium text-green-700 hover:bg-green-100 dark:border-green-700 dark:text-green-300 dark:hover:bg-green-900/40"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {showCreateForm && (
        <div className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="mb-2 text-sm font-medium text-zinc-900 dark:text-zinc-50">Create new API key</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              placeholder="e.g. Marketing site"
              className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreate();
              }}
            />
            <button
              type="button"
              onClick={handleCreate}
              disabled={creating}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {creating ? "Creating..." : "Create"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCreateForm(false);
                setNewKeyName("");
                setError("");
              }}
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {keys.length === 0 ? (
        <div className="mt-4 rounded-lg border-2 border-dashed border-zinc-200 py-8 text-center dark:border-zinc-800">
          <p className="text-sm text-zinc-500">No API keys yet. Create one to get started.</p>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {keys.map((key) => (
            <div
              key={key.id}
              className={`flex items-center justify-between rounded-lg border p-4 ${
                key.revoked
                  ? "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-900/20"
                  : "border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900"
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-zinc-900 dark:text-zinc-50">{key.name}</p>
                  {key.revoked && (
                    <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900/40 dark:text-red-400">
                      Revoked
                    </span>
                  )}
                </div>
                <div className="mt-1 flex flex-wrap gap-4 text-xs text-zinc-500">
                  <span>Created: {formatDate(key.createdAt)}</span>
                  <span>Last used: {formatDate(key.lastUsedAt)}</span>
                </div>
              </div>
              {!key.revoked && (
                <button
                  type="button"
                  onClick={() => handleRevoke(key.id)}
                  className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
