"use client";

import Link from "next/link";
import { useState } from "react";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  questionsCount: number;
  testimonialsCount: number;
};

type CategoriesManagerProps = {
  projectId: string;
  initialCategories: Category[];
};

type ApiCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  _count?: {
    questions?: number;
    testimonials?: number;
  };
};

function toCategory(item: ApiCategory): Category {
  return {
    id: item.id,
    name: item.name,
    slug: item.slug,
    description: item.description,
    isActive: item.isActive,
    questionsCount: item._count?.questions ?? 0,
    testimonialsCount: item._count?.testimonials ?? 0,
  };
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

export function CategoriesManager({ projectId, initialCategories }: CategoriesManagerProps) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [embedCategory, setEmbedCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isEmbedOpen, setIsEmbedOpen] = useState(false);

  const [createName, setCreateName] = useState("");
  const [createSlug, setCreateSlug] = useState("");
  const [createDescription, setCreateDescription] = useState("");

  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editActive, setEditActive] = useState(true);

  async function refreshCategories() {
    const res = await fetch(`/api/projects/${projectId}/categories`);
    if (!res.ok) {
      throw new Error("Failed to load categories.");
    }
    const data = (await res.json()) as ApiCategory[];
    setCategories(data.map(toCategory));
  }

  function openEditModal(category: Category) {
    setSelectedCategory(category);
    setEditName(category.name);
    setEditSlug(category.slug);
    setEditDescription(category.description ?? "");
    setEditActive(category.isActive);
    setIsEditOpen(true);
  }

  function openDeleteModal(category: Category) {
    setSelectedCategory(category);
    setIsDeleteOpen(true);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!createName.trim()) {
      setError("Category name is required.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/projects/${projectId}/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: createName.trim(),
          slug: createSlug.trim() || undefined,
          description: createDescription.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create category.");
        return;
      }

      await refreshCategories();
      setIsCreateOpen(false);
      setCreateName("");
      setCreateSlug("");
      setCreateDescription("");
    } catch {
      setError("Failed to create category.");
    } finally {
      setLoading(false);
    }
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedCategory) return;
    if (!editName.trim()) {
      setError("Category name is required.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/projects/${projectId}/categories/${selectedCategory.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim(),
          slug: editSlug.trim() || undefined,
          description: editDescription.trim() || undefined,
          isActive: editActive,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to update category.");
        return;
      }

      await refreshCategories();
      setIsEditOpen(false);
      setSelectedCategory(null);
    } catch {
      setError("Failed to update category.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!selectedCategory) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/projects/${projectId}/categories/${selectedCategory.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to delete category.");
        return;
      }

      await refreshCategories();
      setIsDeleteOpen(false);
      setSelectedCategory(null);
    } catch {
      setError("Failed to delete category.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Categories</h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">All categories for this project.</p>
        </div>
        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Add category
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {categories.length === 0 ? (
        <p className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
          No categories found.
        </p>
      ) : (
        <div className="space-y-3">
          {categories.map((category) => (
            <div
              key={category.id}
              className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-zinc-900 dark:text-zinc-50">{category.name}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Slug: {category.slug}</p>
                </div>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {category.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              {category.description && (
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">{category.description}</p>
              )}

              <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                Questions: {category.questionsCount} | Testimonials: {category.testimonialsCount}
              </div>

              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEmbedCategory(category);
                    setIsEmbedOpen(true);
                  }}
                  className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Embed code
                </button>
                <Link
                  href={`/submit/${category.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Open actual form
                </Link>
                <Link
                  href={`/dashboard/projects/${projectId}/categories/${category.id}`}
                  className="rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                  Open questions
                </Link>
                <button
                  type="button"
                  onClick={() => openEditModal(category)}
                  className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => openDeleteModal(category)}
                  className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isCreateOpen && (
        <Modal
          title="Create category"
          onClose={() => {
            if (loading) return;
            setIsCreateOpen(false);
            setCreateName("");
            setCreateSlug("");
            setCreateDescription("");
          }}
        >
          <form onSubmit={handleCreate} className="space-y-3">
            <div>
              <label htmlFor="create-category-name" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Name
              </label>
              <input
                id="create-category-name"
                type="text"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                required
                disabled={loading}
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label htmlFor="create-category-slug" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Slug (optional)
              </label>
              <input
                id="create-category-slug"
                type="text"
                value={createSlug}
                onChange={(e) => setCreateSlug(e.target.value)}
                disabled={loading}
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label
                htmlFor="create-category-description"
                className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Description (optional)
              </label>
              <textarea
                id="create-category-description"
                value={createDescription}
                onChange={(e) => setCreateDescription(e.target.value)}
                rows={4}
                disabled={loading}
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsCreateOpen(false);
                  setCreateName("");
                  setCreateSlug("");
                  setCreateDescription("");
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
                {loading ? "Creating..." : "Create category"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {isEditOpen && selectedCategory && (
        <Modal
          title={`Edit ${selectedCategory.name}`}
          onClose={() => {
            if (loading) return;
            setIsEditOpen(false);
            setSelectedCategory(null);
          }}
        >
          <form onSubmit={handleEdit} className="space-y-3">
            <div>
              <label htmlFor="edit-category-name" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Name
              </label>
              <input
                id="edit-category-name"
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
                disabled={loading}
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label htmlFor="edit-category-slug" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Slug
              </label>
              <input
                id="edit-category-slug"
                type="text"
                value={editSlug}
                onChange={(e) => setEditSlug(e.target.value)}
                disabled={loading}
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label
                htmlFor="edit-category-description"
                className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Description (optional)
              </label>
              <textarea
                id="edit-category-description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={4}
                disabled={loading}
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
              <input
                type="checkbox"
                checked={editActive}
                onChange={(e) => setEditActive(e.target.checked)}
                disabled={loading}
                className="rounded border-zinc-300"
              />
              Active category
            </label>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsEditOpen(false);
                  setSelectedCategory(null);
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
                {loading ? "Saving..." : "Save changes"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {isDeleteOpen && selectedCategory && (
        <Modal
          title="Delete category"
          onClose={() => {
            if (loading) return;
            setIsDeleteOpen(false);
            setSelectedCategory(null);
          }}
        >
          <div className="space-y-4">
            <p className="text-sm text-zinc-700 dark:text-zinc-300">
              Are you sure you want to delete <strong>{selectedCategory.name}</strong>? This action cannot be
              undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteOpen(false);
                  setSelectedCategory(null);
                }}
                disabled={loading}
                className="rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                {loading ? "Deleting..." : "Delete category"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {isEmbedOpen && embedCategory && (
        <Modal
          title={`Embed code: ${embedCategory.name}`}
          onClose={() => {
            setIsEmbedOpen(false);
            setEmbedCategory(null);
          }}
        >
          <div className="space-y-3">
            <p className="text-sm text-zinc-600 dark:text-zinc-300">
              Paste this iframe where you want testimonials to appear.
            </p>
            <code className="block whitespace-pre-wrap rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
              {`<iframe src="${typeof window !== "undefined" ? window.location.origin : ""}/embed/testimonials/${embedCategory.id}" width="100%" height="600" style="border:0;" loading="lazy"></iframe>`}
            </code>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={async () => {
                  const embedCode = `<iframe src="${window.location.origin}/embed/testimonials/${embedCategory.id}" width="100%" height="600" style="border:0;" loading="lazy"></iframe>`;
                  await navigator.clipboard.writeText(embedCode);
                }}
                className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                Copy embed code
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
