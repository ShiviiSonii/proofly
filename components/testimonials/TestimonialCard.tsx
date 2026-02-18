"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MediaDisplay } from "@/components/public/MediaDisplay";

type Question = { id: string; label: string; type?: string };

type TestimonialCardProps = {
  projectId: string;
  categoryId: string;
  testimonial: {
    id: string;
    data: Record<string, unknown>;
    status: string;
    submittedBy: string | null;
    createdAt: string;
  };
  questions: Question[];
};

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (Array.isArray(value)) return (value as string[]).join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export function TestimonialCard({
  projectId,
  categoryId,
  testimonial,
  questions,
}: TestimonialCardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const questionMap = new Map(
    questions.map((q) => [q.id, { label: q.label, type: q.type ?? "" }])
  );
  const data = testimonial.data as Record<string, unknown>;
  const entries = Object.entries(data).map(([id, value]) => ({
    id,
    label: questionMap.get(id)?.label ?? id,
    type: questionMap.get(id)?.type ?? "",
    value: formatValue(value),
    rawValue: value,
  }));

  async function updateStatus(status: string) {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/projects/${projectId}/categories/${categoryId}/testimonials/${testimonial.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        }
      );
      if (res.ok) router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this testimonial?")) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/projects/${projectId}/categories/${categoryId}/testimonials/${testimonial.id}`,
        { method: "DELETE" }
      );
      if (res.ok) router.refresh();
    } finally {
      setLoading(false);
    }
  }

  const statusColors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
    approved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  };
  const statusClass = statusColors[testimonial.status] ?? "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300";

  return (
    <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div
        className="flex cursor-pointer items-start justify-between gap-4 p-4"
        onClick={() => setExpanded((e) => !e)}
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded px-2 py-0.5 text-xs font-medium ${statusClass}`}>
              {testimonial.status}
            </span>
            {testimonial.submittedBy && (
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                {testimonial.submittedBy}
              </span>
            )}
            <span className="text-xs text-zinc-400">
              {new Date(testimonial.createdAt).toLocaleString()}
            </span>
          </div>
          {entries.length > 0 && (
            <p className="mt-1 truncate text-sm text-zinc-700 dark:text-zinc-300">
              {entries[0].label}: {entries[0].value}
            </p>
          )}
        </div>
        <span className="text-zinc-400">{expanded ? "▼" : "▶"}</span>
      </div>

      {expanded && (
        <div className="border-t border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <dl className="space-y-2">
            {entries.map(({ id, label, type, value, rawValue }) => (
              <div key={id}>
                <dt className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{label}</dt>
                <dd className="mt-0.5 text-sm text-zinc-900 dark:text-zinc-100">
                  {(type === "image" || type === "video") && typeof rawValue === "string" ? (
                    <MediaDisplay type={type} value={rawValue} />
                  ) : (
                    value
                  )}
                </dd>
              </div>
            ))}
          </dl>
          <div className="mt-4 flex flex-wrap gap-2">
            {testimonial.status !== "approved" && (
              <button
                type="button"
                disabled={loading}
                onClick={(e) => {
                  e.stopPropagation();
                  updateStatus("approved");
                }}
                className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
              >
                Approve
              </button>
            )}
            {testimonial.status !== "rejected" && (
              <button
                type="button"
                disabled={loading}
                onClick={(e) => {
                  e.stopPropagation();
                  updateStatus("rejected");
                }}
                className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                Reject
              </button>
            )}
            {testimonial.status !== "pending" && (
              <button
                type="button"
                disabled={loading}
                onClick={(e) => {
                  e.stopPropagation();
                  updateStatus("pending");
                }}
                className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Set pending
              </button>
            )}
            <button
              type="button"
              disabled={loading}
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
              className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
