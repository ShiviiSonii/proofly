"use client";

import { useState, useEffect } from "react";
import { QUESTION_TYPES, needsOptions, getValidationDefaults } from "@/lib/question-types";

export type FormQuestionData = {
  label: string;
  type: string;
  required: boolean;
  placeholder?: string;
  options?: string[];
  validation?: { min?: number; max?: number; pattern?: string };
};

type QuestionFormProps = {
  projectId: string;
  categoryId: string;
  questionId?: string;
  defaultValues?: Partial<FormQuestionData> & { options?: string[] | null; validation?: Record<string, unknown> | null };
  mode: "create" | "edit";
  onSuccess: () => void;
  onCancel: () => void;
};

export function QuestionForm({
  projectId,
  categoryId,
  questionId,
  defaultValues,
  mode,
  onSuccess,
  onCancel,
}: QuestionFormProps) {
  const [label, setLabel] = useState(defaultValues?.label ?? "");
  const [type, setType] = useState(defaultValues?.type ?? "text");
  const [required, setRequired] = useState(defaultValues?.required ?? false);
  const [placeholder, setPlaceholder] = useState(defaultValues?.placeholder ?? "");
  const [optionsText, setOptionsText] = useState(
    Array.isArray(defaultValues?.options)
      ? defaultValues.options.join("\n")
      : defaultValues?.options && typeof defaultValues.options === "object"
        ? (defaultValues.options as string[]).join("\n")
        : ""
  );
  const [validation, setValidation] = useState<{ min?: number; max?: number; pattern?: string }>(
    defaultValues?.validation && typeof defaultValues.validation === "object"
      ? (defaultValues.validation as { min?: number; max?: number; pattern?: string })
      : {}
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const defaults = getValidationDefaults(type);
    if (defaults && (!validation.min && validation.min !== 0) && (!validation.max && validation.max !== 0)) {
      setValidation((v) => ({ ...v, ...defaults }));
    }
  }, [type]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const options = needsOptions(type)
      ? optionsText
          .split("\n")
          .map((o) => o.trim())
          .filter(Boolean)
      : undefined;

    if (needsOptions(type) && (!options || options.length === 0)) {
      setError("Add at least one option");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        label: label.trim(),
        type,
        required,
        placeholder: placeholder.trim() || undefined,
        options: options ?? undefined,
        validation: type === "rating" || type === "number" ? validation : undefined,
      };

      if (mode === "create") {
        const res = await fetch(`/api/projects/${projectId}/categories/${categoryId}/questions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Failed to add question");
          setLoading(false);
          return;
        }
      } else if (questionId) {
        const res = await fetch(
          `/api/projects/${projectId}/categories/${categoryId}/questions/${questionId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Failed to update question");
          setLoading(false);
          return;
        }
      }
      onSuccess();
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  }

  const showOptions = needsOptions(type);
  const showValidation = type === "rating" || type === "number";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </p>
      )}
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Question label
        </label>
        <input
          type="text"
          required
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="e.g. What did you think of our service?"
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Type
        </label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        >
          {QUESTION_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={required}
            onChange={(e) => setRequired(e.target.checked)}
            className="rounded border-zinc-300"
          />
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Required
          </span>
        </label>
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Placeholder (optional)
        </label>
        <input
          type="text"
          value={placeholder}
          onChange={(e) => setPlaceholder(e.target.value)}
          placeholder="Placeholder text"
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        />
      </div>
      {showOptions && (
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Options (one per line)
          </label>
          <textarea
            value={optionsText}
            onChange={(e) => setOptionsText(e.target.value)}
            rows={4}
            placeholder="Option 1&#10;Option 2&#10;Option 3"
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </div>
      )}
      {showValidation && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Min
            </label>
            <input
              type="number"
              value={validation.min ?? ""}
              onChange={(e) =>
                setValidation((v) => ({ ...v, min: e.target.value ? Number(e.target.value) : undefined }))
              }
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Max
            </label>
            <input
              type="number"
              value={validation.max ?? ""}
              onChange={(e) =>
                setValidation((v) => ({ ...v, max: e.target.value ? Number(e.target.value) : undefined }))
              }
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>
        </div>
      )}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {loading ? "Saving..." : mode === "create" ? "Add question" : "Save changes"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
