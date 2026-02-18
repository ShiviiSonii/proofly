import { NextResponse } from "next/server";
import { getCloudinaryClient } from "@/lib/cloudinary";
import { Readable } from "stream";

const MAX_VIDEO_BYTES = 50 * 1024 * 1024; // 50MB
const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-msvideo",
] as const;

/**
 * Public video upload for testimonial forms.
 * POST with FormData: { file: File, categoryId?: string }
 * Returns { url: "https://..." } - public URL from Cloudinary.
 *
 * Requires:
 * - CLOUDINARY_CLOUD_NAME env var
 * - CLOUDINARY_API_KEY env var
 * - CLOUDINARY_API_SECRET env var
 */

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const categoryId = (formData.get("categoryId") as string) || "shared";

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (
      !ALLOWED_VIDEO_TYPES.includes(
        file.type as (typeof ALLOWED_VIDEO_TYPES)[number],
      )
    ) {
      return NextResponse.json(
        { error: "Only MP4, WebM, MOV, and AVI videos are allowed" },
        { status: 400 },
      );
    }

    if (file.size > MAX_VIDEO_BYTES) {
      return NextResponse.json(
        { error: "Video must be 50MB or smaller" },
        { status: 400 },
      );
    }

    const cloudinary = getCloudinaryClient();

    // Convert the browser File to a Node Buffer and then to a stream.
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const stream = Readable.from(buffer);

    return new Promise((resolve) => {
      // Wrap upload in a promise to handle the stream
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "video",
          folder: `testimonials/${categoryId}`,
          public_id: undefined, // Let Cloudinary generate unique ID
          overwrite: false,
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary upload error:", error);
            resolve(
              NextResponse.json(
                { error: error.message || "Upload failed" },
                { status: 500 },
              ),
            );
            return;
          }

          if (!result) {
            resolve(
              NextResponse.json({ error: "Upload failed" }, { status: 500 }),
            );
            return;
          }

          resolve(NextResponse.json({ url: result.secure_url }));
        },
      );

      stream.pipe(uploadStream);
    });
  } catch (err) {
    console.error("Upload error:", err);
    if (
      err instanceof Error &&
      err.message.includes("Missing Cloudinary credentials")
    ) {
      return NextResponse.json(
        {
          error:
            "Storage not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.",
        },
        { status: 500 },
      );
    }
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
