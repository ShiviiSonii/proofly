"use client";

import { getVideoEmbedUrl, isImageUrl } from "@/lib/media";

/**
 * Renders a single testimonial value as image or video when the question type is image/video.
 * Used in dashboard (TestimonialCard) and embed page.
 */
export function MediaDisplay({
  type,
  value,
  label,
}: {
  type: string;
  value: string;
  label?: string;
}) {
  if (!value || typeof value !== "string") return null;

  if (type === "image" && isImageUrl(value)) {
    return (
      <div className="mt-2">
        {label && (
          <p className="mb-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">{label}</p>
        )}
        <img
          src={value}
          alt={label || "Testimonial"}
          className="max-h-48 rounded-lg border border-zinc-200 object-cover dark:border-zinc-700"
        />
      </div>
    );
  }

  if (type === "video") {
    // Check if it's a Cloudinary video URL
    const isCloudinaryVideo = value.includes("cloudinary.com") || value.includes("res.cloudinary.com");
    
    if (isCloudinaryVideo) {
      // Cloudinary videos can be embedded directly
      return (
        <div className="mt-2">
          {label && (
            <p className="mb-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">{label}</p>
          )}
          <div className="aspect-video w-full max-w-md overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700">
            <video
              src={value}
              controls
              className="h-full w-full"
            >
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      );
    }

    // Try YouTube/Vimeo embed
    const embedUrl = getVideoEmbedUrl(value);
    if (embedUrl) {
      return (
        <div className="mt-2">
          {label && (
            <p className="mb-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">{label}</p>
          )}
          <div className="aspect-video w-full max-w-md overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700">
            <iframe
              src={embedUrl}
              title="Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-full"
            />
          </div>
        </div>
      );
    }

    // Fallback: show as link
    return (
      <div className="mt-2">
        {label && (
          <p className="mb-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">{label}</p>
        )}
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 underline dark:text-blue-400"
        >
          Watch video
        </a>
      </div>
    );
  }

  return null;
}
