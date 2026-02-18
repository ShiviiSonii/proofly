/**
 * Helpers for image and video in testimonials.
 * Used when displaying values in dashboard and embed.
 */

/** Allowed image extensions for upload */
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"] as const;
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB

/**
 * Turns a video page URL into an embed URL for YouTube or Vimeo.
 * Returns null if we don't support embedding (e.g. Loom, Cloudinary) — caller can show video tag or link instead.
 */
export function getVideoEmbedUrl(url: string): string | null {
  if (!url || typeof url !== "string") return null;
  const s = url.trim();
  
  // Cloudinary videos should use <video> tag, not iframe
  if (s.includes("cloudinary.com") || s.includes("res.cloudinary.com")) {
    return null;
  }
  
  // YouTube: watch?v=ID or youtu.be/ID
  const ytMatch = s.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  // Vimeo: vimeo.com/123456
  const vimeoMatch = s.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  return null;
}

/**
 * Returns true if the URL is a Cloudinary video URL.
 */
export function isCloudinaryVideo(url: string): boolean {
  if (!url || typeof url !== "string") return false;
  return url.includes("cloudinary.com") || url.includes("res.cloudinary.com");
}

/** True if the value is a URL we can show as image (our uploads or external image URL). */
export function isImageUrl(value: string): boolean {
  if (!value || typeof value !== "string") return false;
  if (value.startsWith("/")) return true; // our uploads (legacy, if any)
  if (value.startsWith("http")) {
    const lower = value.toLowerCase();
    return /\.(jpe?g|png|gif|webp)(\?|$)/i.test(lower) || lower.includes("image");
  }
  return false;
}
