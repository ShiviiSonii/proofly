"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type TestimonialStatus = "pending" | "approved" | "rejected";

type TestimonialStatusActionsProps = {
  projectId: string;
  categoryId: string;
  testimonialId: string;
  currentStatus: TestimonialStatus;
};

export function TestimonialStatusActions({
  projectId,
  categoryId,
  testimonialId,
  currentStatus,
}: TestimonialStatusActionsProps) {
  const router = useRouter();
  const [loadingStatus, setLoadingStatus] = useState<TestimonialStatus | null>(null);
  const [error, setError] = useState("");

  async function updateStatus(status: TestimonialStatus) {
    setLoadingStatus(status);
    setError("");
    try {
      const res = await fetch(
        `/api/projects/${projectId}/categories/${categoryId}/testimonials/${testimonialId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to update status.");
        return;
      }
      router.refresh();
    } catch {
      setError("Failed to update status.");
    } finally {
      setLoadingStatus(null);
    }
  }

  return (
    <div className="mt-3">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => updateStatus("approved")}
          disabled={loadingStatus !== null || currentStatus === "approved"}
          className="rounded-md border border-green-200 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-50 disabled:opacity-50 dark:border-green-900 dark:text-green-400 dark:hover:bg-green-900/20"
        >
          {loadingStatus === "approved" ? "Approving..." : "Approve"}
        </button>
        <button
          type="button"
          onClick={() => updateStatus("rejected")}
          disabled={loadingStatus !== null || currentStatus === "rejected"}
          className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-900/20"
        >
          {loadingStatus === "rejected" ? "Rejecting..." : "Reject"}
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
