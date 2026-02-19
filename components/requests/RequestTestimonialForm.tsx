"use client";

import { useState } from "react";

interface RequestTestimonialFormProps {
  projectId: string;
  categoryId: string;
  categoryName: string;
}

/**
 * Form component for sending testimonial request emails.
 * 
 * Allows users to:
 * - Enter recipient email address
 * - Optionally add a custom message
 * - Send the request via API
 * 
 * Shows success/error feedback after submission.
 */
export function RequestTestimonialForm({
  projectId,
  categoryId,
  categoryName,
}: RequestTestimonialFormProps) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      const res = await fetch(
        `/api/projects/${projectId}/categories/${categoryId}/requests`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, message: message.trim() || undefined }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to send email. Please try again.");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setEmail("");
      setMessage("");
      setLoading(false);

      // Reset success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
        Request testimonial by email
      </h3>
      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
        Send an email invitation to collect a testimonial for "{categoryName}".
      </p>

      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <div>
          <label
            htmlFor="request-email"
            className="block text-xs font-medium text-zinc-700 dark:text-zinc-300"
          >
            Recipient email
          </label>
          <input
            id="request-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="customer@example.com"
            className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-500"
            disabled={loading}
          />
        </div>

        <div>
          <label
            htmlFor="request-message"
            className="block text-xs font-medium text-zinc-700 dark:text-zinc-300"
          >
            Custom message (optional)
          </label>
          <textarea
            id="request-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Add a personal message to your request..."
            rows={3}
            className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-500"
            disabled={loading}
          />
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-2 text-xs text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-md bg-green-50 p-2 text-xs text-green-600 dark:bg-green-900/20 dark:text-green-400">
            ✅ Email sent successfully! The recipient will receive an invitation to submit their testimonial.
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {loading ? "Sending..." : "Send request email"}
        </button>
      </form>
    </div>
  );
}
