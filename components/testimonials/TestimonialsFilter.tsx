"use client";

import Link from "next/link";

type TestimonialsFilterProps = {
  projectId: string;
  categoryId: string;
  currentStatus: string | undefined;
  counts: Record<string, number>;
};

export function TestimonialsFilter({
  projectId,
  categoryId,
  currentStatus,
  counts,
}: TestimonialsFilterProps) {
  const base = `/dashboard/projects/${projectId}/categories/${categoryId}/testimonials`;
  const pending = counts.pending ?? 0;
  const approved = counts.approved ?? 0;
  const rejected = counts.rejected ?? 0;

  return (
    <div className="mt-6 flex flex-wrap gap-2">
      <Link
        href={base}
        className={`rounded-lg px-4 py-2 text-sm font-medium ${
          !currentStatus
            ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
            : "border border-zinc-200 text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        }`}
      >
        All
      </Link>
      <Link
        href={`${base}?status=pending`}
        className={`rounded-lg px-4 py-2 text-sm font-medium ${
          currentStatus === "pending"
            ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
            : "border border-zinc-200 text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        }`}
      >
        Pending {pending > 0 && `(${pending})`}
      </Link>
      <Link
        href={`${base}?status=approved`}
        className={`rounded-lg px-4 py-2 text-sm font-medium ${
          currentStatus === "approved"
            ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
            : "border border-zinc-200 text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        }`}
      >
        Approved {approved > 0 && `(${approved})`}
      </Link>
      <Link
        href={`${base}?status=rejected`}
        className={`rounded-lg px-4 py-2 text-sm font-medium ${
          currentStatus === "rejected"
            ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
            : "border border-zinc-200 text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        }`}
      >
        Rejected {rejected > 0 && `(${rejected})`}
      </Link>
    </div>
  );
}
