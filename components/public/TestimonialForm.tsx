"use client";

import { useState } from "react";
import { FormField } from "./FormField";

type Question = {
  id: string;
  label: string;
  type: string;
  required: boolean;
  placeholder: string | null;
  options: unknown;
  validation: unknown;
};

type Category = {
  id: string;
  name: string;
  description: string | null;
  slug: string;
};

type TestimonialFormProps = {
  category: Category;
  questions: Question[];
};

export function TestimonialForm({ category, questions }: TestimonialFormProps) {
  const [data, setData] = useState<Record<string, string | number | string[]>>({});
  const [submittedBy, setSubmittedBy] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  function updateValue(questionId: string, value: string | number | string[]) {
    setData((prev) => ({ ...prev, [questionId]: value }));
    if (fieldErrors[questionId]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[questionId];
        return next;
      });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setLoading(true);

    try {
      const res = await fetch("/api/public/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId: category.id,
          data,
          submittedBy: submittedBy.trim() || undefined,
        }),
      });
      const result = await res.json();

      if (!res.ok) {
        if (result.errors && typeof result.errors === "object") {
          setFieldErrors(result.errors);
        }
        setError(result.error || "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      setSuccess(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="mx-auto max-w-md rounded-xl border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Thank you!
        </h2>
        <p className="mt-2 text-sm text-zinc-500">
          Your testimonial has been submitted successfully.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-md space-y-6">
      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          {category.name}
        </h2>
        {category.description && (
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {category.description}
          </p>
        )}
      </div>

      {questions.length === 0 ? (
        <p className="text-sm text-zinc-500">This form has no questions yet.</p>
      ) : (
        <>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Your name (optional)
            </label>
            <input
              type="text"
              value={submittedBy}
              onChange={(e) => setSubmittedBy(e.target.value)}
              placeholder="John Doe"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>

          <div className="space-y-6 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
            {questions.map((q) => (
              <FormField
                key={q.id}
                question={q}
                value={data[q.id] ?? (q.type === "checkbox" ? [] : "")}
                onChange={(value) => updateValue(q.id, value)}
                error={fieldErrors[q.id]}
                categoryId={category.id}
              />
            ))}
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-zinc-900 py-3 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {loading ? "Submitting..." : "Submit testimonial"}
          </button>
        </>
      )}
    </form>
  );
}
