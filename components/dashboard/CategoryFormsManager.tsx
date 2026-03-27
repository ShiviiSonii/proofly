"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ExternalLink } from "lucide-react";

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
  description,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  description?: string;
}) {
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
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
        </div>
        <Button
          type="button"
          onClick={() => setIsCreateOpen(true)}
        >
          Add question
        </Button>
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
                  <Button
                    type="button"
                    onClick={() => openEditModal(question)}
                    variant="outline"
                    size="sm"
                  >
                    Edit
                  </Button>
                  <Button
                    type="button"
                    onClick={() => openDeleteModal(question)}
                    variant="destructive"
                    size="sm"
                  >
                    Delete
                  </Button>
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
            <div className="flex flex-col gap-2">
              <Label htmlFor="create-form-label">Label</Label>
              <Input
                id="create-form-label"
                type="text"
                value={createLabel}
                onChange={(e) => setCreateLabel(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="create-form-type">Type</Label>
              <Select
                value={createType}
                onValueChange={(value) => setCreateType(value as QuestionType)}
                disabled={loading}
              >
                <SelectTrigger id="create-form-type" className="mt-1 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {QUESTION_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="create-form-placeholder">Placeholder (optional)</Label>
              <Input
                id="create-form-placeholder"
                type="text"
                value={createPlaceholder}
                onChange={(e) => setCreatePlaceholder(e.target.value)}
                disabled={loading}
              />
            </div>

            {["dropdown", "checkbox", "radio"].includes(createType) && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="create-form-options">Options (comma separated)</Label>
                <Input
                  id="create-form-options"
                  type="text"
                  value={createOptions}
                  onChange={(e) => setCreateOptions(e.target.value)}
                  disabled={loading}
                />
              </div>
            )}

            <Label className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                checked={createRequired}
                onChange={(e) => setCreateRequired(e.target.checked)}
                disabled={loading}
                className="rounded border-zinc-300"
              />
              Required field
            </Label>

            <DialogFooter>
              <Button
                type="button"
                onClick={() => {
                  setIsCreateOpen(false);
                  resetCreateState();
                }}
                disabled={loading}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
              >
                {loading ? "Creating..." : "Create question"}
              </Button>
            </DialogFooter>
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
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-form-label">Label</Label>
              <Input
                id="edit-form-label"
                type="text"
                value={editLabel}
                onChange={(e) => setEditLabel(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-form-type">Type</Label>
              <Select
                value={editType}
                onValueChange={(value) => setEditType(value as QuestionType)}
                disabled={loading}
              >
                <SelectTrigger id="edit-form-type" className="mt-1 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {QUESTION_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-form-placeholder">Placeholder (optional)</Label>
              <Input
                id="edit-form-placeholder"
                type="text"
                value={editPlaceholder}
                onChange={(e) => setEditPlaceholder(e.target.value)}
                disabled={loading}
              />
            </div>

            {["dropdown", "checkbox", "radio"].includes(editType) && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="edit-form-options">Options (comma separated)</Label>
                <Input
                  id="edit-form-options"
                  type="text"
                  value={editOptions}
                  onChange={(e) => setEditOptions(e.target.value)}
                  disabled={loading}
                />
              </div>
            )}

            <Label className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                checked={editRequired}
                onChange={(e) => setEditRequired(e.target.checked)}
                disabled={loading}
                className="rounded border-zinc-300"
              />
              Required field
            </Label>

            <DialogFooter>
              <Button
                type="button"
                onClick={() => {
                  setIsEditOpen(false);
                  setSelectedQuestion(null);
                }}
                disabled={loading}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        </Modal>
      )}

      {isDeleteOpen && selectedQuestion && (
        <Modal
          title="Delete question"
          description={`Delete "${selectedQuestion.label}"? This action cannot be undone.`}
          onClose={() => {
            if (loading) return;
            setIsDeleteOpen(false);
            setSelectedQuestion(null);
          }}
        >
          <div className="space-y-4">
            <DialogFooter>
              <Button
                type="button"
                onClick={() => {
                  setIsDeleteOpen(false);
                  setSelectedQuestion(null);
                }}
                disabled={loading}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                variant="destructive"
              >
                {loading ? "Deleting..." : "Delete question"}
              </Button>
            </DialogFooter>
          </div>
        </Modal>
      )}

      {isEmbedOpen && (
        <Modal
          title={`Embed code: ${categoryName}`}
          description="Paste this iframe where you want testimonials to appear."
          onClose={() => {
            setIsEmbedOpen(false);
          }}
        >
          <div className="space-y-3">
            <code className="block whitespace-pre-wrap rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
              {`<iframe src="${typeof window !== "undefined" ? window.location.origin : ""}/embed/testimonials/${categoryId}" width="100%" height="600" style="border:0;" loading="lazy"></iframe>`}
            </code>
            <DialogFooter>
              <Button
                type="button"
                onClick={async () => {
                  const embedCode = `<iframe src="${window.location.origin}/embed/testimonials/${categoryId}" width="100%" height="600" style="border:0;" loading="lazy"></iframe>`;
                  await navigator.clipboard.writeText(embedCode);
                }}
              >
                Copy embed code
              </Button>
            </DialogFooter>
          </div>
        </Modal>
      )}
    </div>
  );
}
