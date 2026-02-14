"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type DeleteCategoryButtonProps = {
  projectId: string;
  categoryId: string;
  categoryName: string;
};

export function DeleteCategoryButton({
  projectId,
  categoryId,
  categoryName,
}: DeleteCategoryButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);

  async function handleDelete() {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `/api/projects/${projectId}/categories/${categoryId}`,
        { method: "DELETE" }
      );
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to delete");
        setLoading(false);
        return;
      }
      router.push(`/dashboard/projects/${projectId}/categories`);
      router.refresh();
    } catch {
      alert("Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="mt-6 border-t border-zinc-200 pt-6 dark:border-zinc-800">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        Danger zone
      </h2>
      <p className="mt-1 text-sm text-zinc-500">
        Deleting &quot;{categoryName}&quot; will remove all questions and testimonials in this category. This cannot be undone.
      </p>
      <div className="mt-3 flex gap-3">
        {confirming ? (
          <>
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? "Deleting..." : "Yes, delete category"}
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              disabled={loading}
              className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-900/20"
          >
            Delete category
          </button>
        )}
      </div>
    </div>
  );
}
