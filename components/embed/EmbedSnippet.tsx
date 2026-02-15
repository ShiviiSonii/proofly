"use client";

import { useState } from "react";

type EmbedSnippetProps = {
  categoryId: string;
  categoryName: string;
  baseUrl: string;
};

export function EmbedSnippet({ categoryId, categoryName, baseUrl }: EmbedSnippetProps) {
  const [copied, setCopied] = useState(false);

  // Minimal embed code: div is the placeholder where embed.js injects the iframe;
  // script loads embed.js and passes categoryId (which testimonials) and data-container (which div to use).
  const snippet = `<div id="proofly-testimonials"></div>
<script src="${baseUrl}/embed.js" data-category-id="${categoryId}" data-container="proofly-testimonials"><\/script>`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-zinc-500">
        Paste this code on your website where you want approved testimonials for &quot;{categoryName}&quot; to appear.
      </p>
      <pre className="overflow-x-auto rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-xs text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
        <code>{snippet}</code>
      </pre>
      <button
        type="button"
        onClick={handleCopy}
        className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        {copied ? "Copied!" : "Copy code"}
      </button>
    </div>
  );
}
