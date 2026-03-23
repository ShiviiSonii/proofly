"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
        <Button type="button" onClick={() => setIsCreateOpen(true)}>
          Add category
        </Button>
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
            <Card key={category.id}>
              <CardContent className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-zinc-900 dark:text-zinc-50">{category.name}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Slug: {category.slug}</p>
                </div>
                <Badge variant={category.isActive ? "default" : "secondary"}>
                  {category.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>

              {category.description && (
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">{category.description}</p>
              )}

              <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                Questions: {category.questionsCount} | Testimonials: {category.testimonialsCount}
              </div>

              <div className="mt-3 flex gap-2">
                <Button
                  type="button"
                  onClick={() => {
                    setEmbedCategory(category);
                    setIsEmbedOpen(true);
                  }}
                  variant="outline"
                  size="sm"
                >
                  Embed code
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/submit/${category.id}`} target="_blank" rel="noopener noreferrer">
                    Open actual form
                  </Link>
                </Button>
                <Button asChild size="sm">
                  <Link href={`/dashboard/projects/${projectId}/categories/${category.id}`}>
                    Open questions
                  </Link>
                </Button>
                <Button
                  type="button"
                  onClick={() => openEditModal(category)}
                  variant="outline"
                  size="sm"
                >
                  Edit
                </Button>
                <Button
                  type="button"
                  onClick={() => openDeleteModal(category)}
                  variant="destructive"
                  size="sm"
                >
                  Delete
                </Button>
              </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {isCreateOpen && (
        <Dialog
          open={isCreateOpen}
          onOpenChange={(open) => {
            if (!open) {
              setIsCreateOpen(false);
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create category</DialogTitle>
              <DialogDescription>Create a new category for this project.</DialogDescription>
            </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="create-category-name">Name</Label>
              <Input
                id="create-category-name"
                type="text"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-category-slug">Slug (optional)</Label>
              <Input
                id="create-category-slug"
                type="text"
                value={createSlug}
                onChange={(e) => setCreateSlug(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-category-description">Description (optional)</Label>
              <Textarea
                id="create-category-description"
                value={createDescription}
                onChange={(e) => setCreateDescription(e.target.value)}
                rows={4}
                disabled={loading}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreateOpen(false);
                  setCreateName("");
                  setCreateSlug("");
                  setCreateDescription("");
                }}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create category"}
              </Button>
            </DialogFooter>
          </form>
          </DialogContent>
        </Dialog>
      )}

      {isEditOpen && selectedCategory && (
        <Dialog
          open={isEditOpen}
          onOpenChange={(open) => {
            if (!open) {
              setIsEditOpen(false);
              setSelectedCategory(null);
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{`Edit ${selectedCategory.name}`}</DialogTitle>
              <DialogDescription>Update category details.</DialogDescription>
            </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="edit-category-name">Name</Label>
              <Input
                id="edit-category-name"
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-category-slug">Slug</Label>
              <Input
                id="edit-category-slug"
                type="text"
                value={editSlug}
                onChange={(e) => setEditSlug(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-category-description">Description (optional)</Label>
              <Textarea
                id="edit-category-description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={4}
                disabled={loading}
              />
            </div>

            <Label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={editActive}
                onChange={(e) => setEditActive(e.target.checked)}
                disabled={loading}
                className="rounded border-zinc-300"
              />
              Active category
            </Label>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditOpen(false);
                  setSelectedCategory(null);
                }}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
          </DialogContent>
        </Dialog>
      )}

      {isDeleteOpen && selectedCategory && (
        <Dialog
          open={isDeleteOpen}
          onOpenChange={(open) => {
            if (!open) {
              setIsDeleteOpen(false);
              setSelectedCategory(null);
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete category</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete <strong>{selectedCategory.name}</strong>? This action cannot be
                undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDeleteOpen(false);
                  setSelectedCategory(null);
                }}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="button" variant="destructive" onClick={handleDelete} disabled={loading}>
                {loading ? "Deleting..." : "Delete category"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {isEmbedOpen && embedCategory && (
        <Dialog
          open={isEmbedOpen}
          onOpenChange={(open) => {
            if (!open) {
              setIsEmbedOpen(false);
              setEmbedCategory(null);
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{`Embed code: ${embedCategory.name}`}</DialogTitle>
              <DialogDescription>Paste this iframe where you want testimonials to appear.</DialogDescription>
            </DialogHeader>
            <code className="block whitespace-pre-wrap rounded-md border p-3 text-xs">
              {`<iframe src="${typeof window !== "undefined" ? window.location.origin : ""}/embed/testimonials/${embedCategory.id}" width="100%" height="600" style="border:0;" loading="lazy"></iframe>`}
            </code>
            <DialogFooter>
              <Button
                type="button"
                onClick={async () => {
                  const embedCode = `<iframe src="${window.location.origin}/embed/testimonials/${embedCategory.id}" width="100%" height="600" style="border:0;" loading="lazy"></iframe>`;
                  await navigator.clipboard.writeText(embedCode);
                }}
              >
                Copy embed code
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
