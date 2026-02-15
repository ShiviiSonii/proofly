"use client";

import { useState, useEffect } from "react";

type ShareTestimonialLinkProps = {
  categoryId: string;
};

export function ShareTestimonialLink({ categoryId }: ShareTestimonialLinkProps) {
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState(`/submit/${categoryId}`);

  useEffect(() => {
    setUrl(`${window.location.origin}/submit/${categoryId}`);
  }, [categoryId]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
      <input
        type="text"
        readOnly
        value={url}
        className="flex-1 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400"
      />
      <button
        type="button"
        onClick={handleCopy}
        className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        {copied ? "Copied!" : "Copy link"}
      </button>
    </div>
  );
}
