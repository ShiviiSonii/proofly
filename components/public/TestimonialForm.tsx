"use client";

import { useState } from "react";
import { FormField } from "./FormField";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
      <Card className="mx-auto max-w-md text-center">
        <CardHeader>
          <CardTitle>Thank you!</CardTitle>
          <CardDescription>Your testimonial has been submitted successfully.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-md space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{category.name}</CardTitle>
          {category.description ? <CardDescription>{category.description}</CardDescription> : null}
        </CardHeader>
      </Card>

      {questions.length === 0 ? (
        <p className="text-sm text-zinc-500">This form has no questions yet.</p>
      ) : (
        <>
          <div className="space-y-2">
            <Label>Your name (optional)</Label>
            <Input
              type="text"
              value={submittedBy}
              onChange={(e) => setSubmittedBy(e.target.value)}
              placeholder="John Doe"
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

          <Button
            type="submit"
            disabled={loading}
            className="w-full"
          >
            {loading ? "Submitting..." : "Submit testimonial"}
          </Button>
        </>
      )}
    </form>
  );
}
