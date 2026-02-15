"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { QuestionForm } from "./QuestionForm";

type Question = {
  id: string;
  label: string;
  type: string;
  required: boolean;
  order: number;
  placeholder: string | null;
  options: unknown;
  validation: unknown;
};

type QuestionListProps = {
  projectId: string;
  categoryId: string;
};

export function QuestionList({ projectId, categoryId }: QuestionListProps) {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  async function fetchQuestions() {
    try {
      const res = await fetch(`/api/projects/${projectId}/categories/${categoryId}/questions`);
      if (!res.ok) return;
      const data = await res.json();
      setQuestions(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchQuestions();
  }, [projectId, categoryId]);

  async function handleDelete(id: string) {
    if (!confirm("Delete this question?")) return;
    const res = await fetch(
      `/api/projects/${projectId}/categories/${categoryId}/questions/${id}`,
      { method: "DELETE" }
    );
    if (res.ok) {
      setQuestions((q) => q.filter((x) => x.id !== id));
      if (editingId === id) setEditingId(null);
      router.refresh();
    }
  }

  async function moveQuestion(index: number, direction: "up" | "down") {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= questions.length) return;
    const reordered = [...questions];
    const a = reordered[index];
    const b = reordered[newIndex];
    reordered[index] = b;
    reordered[newIndex] = a;
    const questionIds = reordered.map((q) => q.id);
    const res = await fetch(
      `/api/projects/${projectId}/categories/${categoryId}/questions`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionIds }),
      }
    );
    if (res.ok) {
      const data = await res.json();
      setQuestions(data);
      setEditingId(null);
      router.refresh();
    }
  }

  function getOptionsArray(opts: unknown): string[] {
    if (Array.isArray(opts)) return opts as string[];
    if (opts && typeof opts === "object" && "options" in (opts as Record<string, unknown>)) {
      return (opts as { options: string[] }).options ?? [];
    }
    return [];
  }

  if (loading) {
    return (
      <p className="text-sm text-zinc-500">Loading questions...</p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {questions.length} question{questions.length !== 1 ? "s" : ""}
        </h3>
        {!adding && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Add question
          </button>
        )}
      </div>

      {adding && (
        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <h4 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            New question
          </h4>
          <QuestionForm
            projectId={projectId}
            categoryId={categoryId}
            mode="create"
            onSuccess={() => {
              setAdding(false);
              fetchQuestions();
              router.refresh();
            }}
            onCancel={() => setAdding(false)}
          />
        </div>
      )}

      <ul className="space-y-2">
        {questions.map((q, index) => (
          <li
            key={q.id}
            className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
          >
            {editingId === q.id ? (
              <div>
                <h4 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                  Edit question
                </h4>
                <QuestionForm
                  projectId={projectId}
                  categoryId={categoryId}
                  questionId={q.id}
                  mode="edit"
                  defaultValues={{
                    label: q.label,
                    type: q.type,
                    required: q.required,
                    placeholder: q.placeholder ?? "",
                    options: getOptionsArray(q.options),
                    validation: q.validation as Record<string, unknown> | undefined,
                  }}
                  onSuccess={() => {
                    setEditingId(null);
                    fetchQuestions();
                    router.refresh();
                  }}
                  onCancel={() => setEditingId(null)}
                />
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <span className="text-xs text-zinc-400">{index + 1}.</span>{" "}
                    <span className="font-medium text-zinc-900 dark:text-zinc-50">
                      {q.label}
                    </span>
                    {q.required && (
                      <span className="ml-1 text-red-500">*</span>
                    )}
                    <p className="mt-0.5 text-xs text-zinc-500">
                      {q.type}
                      {getOptionsArray(q.options).length > 0 &&
                        ` · ${getOptionsArray(q.options).length} options`}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => moveQuestion(index, "up")}
                      disabled={index === 0}
                      className="rounded p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 disabled:opacity-30 dark:hover:bg-zinc-800"
                      title="Move up"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => moveQuestion(index, "down")}
                      disabled={index === questions.length - 1}
                      className="rounded p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 disabled:opacity-30 dark:hover:bg-zinc-800"
                      title="Move down"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(q.id)}
                      className="rounded px-2 py-1 text-xs text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(q.id)}
                      className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>

      {questions.length === 0 && !adding && (
        <p className="rounded-xl border-2 border-dashed border-zinc-200 py-8 text-center text-sm text-zinc-500 dark:border-zinc-800">
          No questions yet. Add one to build your form.
        </p>
      )}
    </div>
  );
}
