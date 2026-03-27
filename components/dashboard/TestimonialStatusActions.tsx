"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

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
        <Button
          type="button"
          onClick={() => updateStatus("approved")}
          disabled={loadingStatus !== null || currentStatus === "approved"}
          variant="outline"
          size="sm"
        >
          {loadingStatus === "approved" ? "Approving..." : "Approve"}
        </Button>
        <Button
          type="button"
          onClick={() => updateStatus("rejected")}
          disabled={loadingStatus !== null || currentStatus === "rejected"}
          variant="destructive"
          size="sm"
        >
          {loadingStatus === "rejected" ? "Rejecting..." : "Reject"}
        </Button>
      </div>
      {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
