/**
 * Generate a URL-friendly slug from a string.
 * e.g. "Customer Reviews" -> "customer-reviews"
 */
export function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "category";
}
