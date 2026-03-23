"use client";

import Link from "next/link";
import { useState } from "react";

type QuestionType =
  | "text"
  | "textarea"
  | "email"
  | "number"
  | "rating"
  | "dropdown"
  | "checkbox"
  | "radio"
  | "image"
  | "video";

const QUESTION_TYPES: QuestionType[] = [
  "text",
  "textarea",
  "email",
  "number",
  "rating",
  "dropdown",
  "checkbox",
  "radio",
  "image",
  "video",
];

type FormQuestion = {
  id: string;
  label: string;
  type: QuestionType;
  required: boolean;
  order: number;
  placeholder: string | null;
  options: unknown;
  validation: unknown;
};

type CategoryFormsManagerProps = {
  projectId: string;
  categoryId: string;
  categoryName: string;
  initialQuestions: FormQuestion[];
};

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
      <div className="w-full max-w-xl rounded-xl border border-zinc-200 bg-white p-5 shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
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

function parseOptions(input: string): string[] | null {
  const values = input
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  return values.length > 0 ? values : null;
}

export function CategoryFormsManager({
  projectId,
  categoryId,
  categoryName,
  initialQuestions,
}: CategoryFormsManagerProps) {
  const [questions, setQuestions] = useState<FormQuestion[]>(initialQuestions);
  const [selectedQuestion, setSelectedQuestion] = useState<FormQuestion | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isEmbedOpen, setIsEmbedOpen] = useState(false);

  const [createLabel, setCreateLabel] = useState("");
  const [createType, setCreateType] = useState<QuestionType>("text");
  const [createPlaceholder, setCreatePlaceholder] = useState("");
  const [createRequired, setCreateRequired] = useState(false);
  const [createOptions, setCreateOptions] = useState("");

  const [editLabel, setEditLabel] = useState("");
  const [editType, setEditType] = useState<QuestionType>("text");
  const [editPlaceholder, setEditPlaceholder] = useState("");
  const [editRequired, setEditRequired] = useState(false);
  const [editOptions, setEditOptions] = useState("");

  async function refreshQuestions() {
    const res = await fetch(`/api/projects/${projectId}/categories/${categoryId}/questions`);
    if (!res.ok) {
      throw new Error("Failed to load questions.");
    }
    const data = (await res.json()) as FormQuestion[];
    setQuestions(data);
  }

  function resetCreateState() {
    setCreateLabel("");
    setCreateType("text");
    setCreatePlaceholder("");
    setCreateRequired(false);
    setCreateOptions("");
  }

  function openEditModal(question: FormQuestion) {
    setSelectedQuestion(question);
    setEditLabel(question.label);
    setEditType(question.type);
    setEditPlaceholder(question.placeholder ?? "");
    setEditRequired(question.required);
    setEditOptions(Array.isArray(question.options) ? (question.options as string[]).join(", ") : "");
    setIsEditOpen(true);
  }

  function openDeleteModal(question: FormQuestion) {
    setSelectedQuestion(question);
    setIsDeleteOpen(true);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!createLabel.trim()) {
      setError("Question label is required.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const options = ["dropdown", "checkbox", "radio"].includes(createType)
        ? parseOptions(createOptions)
        : null;

      const res = await fetch(`/api/projects/${projectId}/categories/${categoryId}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: createLabel.trim(),
          type: createType,
          required: createRequired,
          placeholder: createPlaceholder.trim() || undefined,
          options,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create question.");
        return;
      }

      await refreshQuestions();
      setIsCreateOpen(false);
      resetCreateState();
    } catch {
      setError("Failed to create question.");
    } finally {
      setLoading(false);
    }
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedQuestion) return;
    if (!editLabel.trim()) {
      setError("Question label is required.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const options = ["dropdown", "checkbox", "radio"].includes(editType) ? parseOptions(editOptions) : null;

      const res = await fetch(
        `/api/projects/${projectId}/categories/${categoryId}/questions/${selectedQuestion.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            label: editLabel.trim(),
            type: editType,
            required: editRequired,
            placeholder: editPlaceholder.trim() || undefined,
            options,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to update question.");
        return;
      }

      await refreshQuestions();
      setIsEditOpen(false);
      setSelectedQuestion(null);
    } catch {
      setError("Failed to update question.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!selectedQuestion) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `/api/projects/${projectId}/categories/${categoryId}/questions/${selectedQuestion.id}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to delete question.");
        return;
      }

      await refreshQuestions();
      setIsDeleteOpen(false);
      setSelectedQuestion(null);
    } catch {
      setError("Failed to delete question.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Questions</h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            All questions for category: <strong>{categoryName}</strong>
          </p>
          <Link
            href={`/submit/${categoryId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-xs font-medium text-blue-600 underline dark:text-blue-400"
          >
            Open actual form
          </Link>
          <button
            type="button"
            onClick={() => setIsEmbedOpen(true)}
            className="mt-2 ml-3 inline-block text-xs font-medium text-blue-600 underline dark:text-blue-400"
          >
            Embed code
          </button>
        </div>
        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Add question
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {questions.length === 0 ? (
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
          No questions created yet.
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map((question, index) => (
            <div
              key={question.id}
              className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-zinc-900 dark:text-zinc-50">
                    {index + 1}. {question.label}
                  </p>
                  <p className="text-xs capitalize text-zinc-500 dark:text-zinc-400">
                    Type: {question.type} {question.required ? "| Required" : "| Optional"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => openEditModal(question)}
                    className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => openDeleteModal(question)}
                    className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-900/20"
                  >
                    Delete
                  </button>
                </div>
              </div>
              {question.placeholder && (
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  Placeholder: {question.placeholder}
                </p>
              )}
              {Array.isArray(question.options) && question.options.length > 0 && (
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  Options: {(question.options as string[]).join(", ")}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {isCreateOpen && (
        <Modal
          title="Create question"
          onClose={() => {
            if (loading) return;
            setIsCreateOpen(false);
            resetCreateState();
          }}
        >
          <form onSubmit={handleCreate} className="space-y-3">
            <div>
              <label htmlFor="create-form-label" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Label
              </label>
              <input
                id="create-form-label"
                type="text"
                value={createLabel}
                onChange={(e) => setCreateLabel(e.target.value)}
                required
                disabled={loading}
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label htmlFor="create-form-type" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Type
              </label>
              <select
                id="create-form-type"
                value={createType}
                onChange={(e) => setCreateType(e.target.value as QuestionType)}
                disabled={loading}
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              >
                {QUESTION_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="create-form-placeholder"
                className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Placeholder (optional)
              </label>
              <input
                id="create-form-placeholder"
                type="text"
                value={createPlaceholder}
                onChange={(e) => setCreatePlaceholder(e.target.value)}
                disabled={loading}
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            {["dropdown", "checkbox", "radio"].includes(createType) && (
              <div>
                <label htmlFor="create-form-options" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Options (comma separated)
                </label>
                <input
                  id="create-form-options"
                  type="text"
                  value={createOptions}
                  onChange={(e) => setCreateOptions(e.target.value)}
                  disabled={loading}
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                />
              </div>
            )}

            <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
              <input
                type="checkbox"
                checked={createRequired}
                onChange={(e) => setCreateRequired(e.target.checked)}
                disabled={loading}
                className="rounded border-zinc-300"
              />
              Required field
            </label>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsCreateOpen(false);
                  resetCreateState();
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
                {loading ? "Creating..." : "Create question"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {isEditOpen && selectedQuestion && (
        <Modal
          title={`Edit question: ${selectedQuestion.label}`}
          onClose={() => {
            if (loading) return;
            setIsEditOpen(false);
            setSelectedQuestion(null);
          }}
        >
          <form onSubmit={handleEdit} className="space-y-3">
            <div>
              <label htmlFor="edit-form-label" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Label
              </label>
              <input
                id="edit-form-label"
                type="text"
                value={editLabel}
                onChange={(e) => setEditLabel(e.target.value)}
                required
                disabled={loading}
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label htmlFor="edit-form-type" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Type
              </label>
              <select
                id="edit-form-type"
                value={editType}
                onChange={(e) => setEditType(e.target.value as QuestionType)}
                disabled={loading}
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              >
                {QUESTION_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="edit-form-placeholder" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Placeholder (optional)
              </label>
              <input
                id="edit-form-placeholder"
                type="text"
                value={editPlaceholder}
                onChange={(e) => setEditPlaceholder(e.target.value)}
                disabled={loading}
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            {["dropdown", "checkbox", "radio"].includes(editType) && (
              <div>
                <label htmlFor="edit-form-options" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Options (comma separated)
                </label>
                <input
                  id="edit-form-options"
                  type="text"
                  value={editOptions}
                  onChange={(e) => setEditOptions(e.target.value)}
                  disabled={loading}
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                />
              </div>
            )}

            <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
              <input
                type="checkbox"
                checked={editRequired}
                onChange={(e) => setEditRequired(e.target.checked)}
                disabled={loading}
                className="rounded border-zinc-300"
              />
              Required field
            </label>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsEditOpen(false);
                  setSelectedQuestion(null);
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

      {isDeleteOpen && selectedQuestion && (
        <Modal
          title="Delete question"
          onClose={() => {
            if (loading) return;
            setIsDeleteOpen(false);
            setSelectedQuestion(null);
          }}
        >
          <div className="space-y-4">
            <p className="text-sm text-zinc-700 dark:text-zinc-300">
              Delete <strong>{selectedQuestion.label}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteOpen(false);
                  setSelectedQuestion(null);
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
                {loading ? "Deleting..." : "Delete question"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {isEmbedOpen && (
        <Modal
          title={`Embed code: ${categoryName}`}
          onClose={() => {
            setIsEmbedOpen(false);
          }}
        >
          <div className="space-y-3">
            <p className="text-sm text-zinc-600 dark:text-zinc-300">
              Paste this iframe where you want testimonials to appear.
            </p>
            <code className="block whitespace-pre-wrap rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
              {`<iframe src="${typeof window !== "undefined" ? window.location.origin : ""}/embed/testimonials/${categoryId}" width="100%" height="600" style="border:0;" loading="lazy"></iframe>`}
            </code>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={async () => {
                  const embedCode = `<iframe src="${window.location.origin}/embed/testimonials/${categoryId}" width="100%" height="600" style="border:0;" loading="lazy"></iframe>`;
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
