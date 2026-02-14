"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { slugify } from "@/lib/slug";

type CategoryFormProps = {
  projectId: string;
  defaultName?: string;
  defaultSlug?: string;
  defaultDescription?: string;
  categoryId?: string;
  mode: "create" | "edit";
};

export function CategoryForm({
  projectId,
  defaultName = "",
  defaultSlug = "",
  defaultDescription = "",
  categoryId,
  mode,
}: CategoryFormProps) {
  const router = useRouter();
  const [name, setName] = useState(defaultName);
  const [slug, setSlug] = useState(defaultSlug);
  const [description, setDescription] = useState(defaultDescription);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  useEffect(() => {
    if (mode === "create" && !slugManuallyEdited && name) {
      setSlug(slugify(name));
    }
  }, [name, mode, slugManuallyEdited]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "create") {
        const res = await fetch(`/api/projects/${projectId}/categories`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            slug: slug.trim() || slugify(name),
            description: description.trim() || null,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Failed to create category");
          setLoading(false);
          return;
        }
        router.push(`/dashboard/projects/${projectId}/categories`);
        router.refresh();
      } else if (mode === "edit" && categoryId) {
        const res = await fetch(
          `/api/projects/${projectId}/categories/${categoryId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: name.trim(),
              slug: slug.trim() || slugify(name),
              description: description.trim() || null,
            }),
          }
        );
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Failed to update category");
          setLoading(false);
          return;
        }
        router.push(`/dashboard/projects/${projectId}/categories/${categoryId}`);
        router.refresh();
      }
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-4">
      {error && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </p>
      )}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Category name
        </label>
        <input
          id="name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Customer Reviews"
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        />
      </div>
      <div>
        <label
          htmlFor="slug"
          className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Slug (URL-friendly)
        </label>
        <input
          id="slug"
          type="text"
          value={slug}
          onChange={(e) => {
            setSlug(e.target.value);
            setSlugManuallyEdited(true);
          }}
          placeholder="customer-reviews"
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        />
        <p className="mt-1 text-xs text-zinc-500">
          Used in the public form URL. Leave blank to auto-generate from name.
        </p>
      </div>
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Description (optional)
        </label>
        <textarea
          id="description"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description of this category"
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        />
      </div>
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {loading
            ? mode === "create"
              ? "Creating..."
              : "Saving..."
            : mode === "create"
              ? "Create category"
              : "Save changes"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
