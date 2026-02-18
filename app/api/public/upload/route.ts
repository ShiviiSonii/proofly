import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES } from "@/lib/media";
import { randomUUID } from "crypto";

/**
 * Public image upload for testimonial forms.
 * POST with FormData: { file: File, categoryId?: string }
 * Returns { url: "https://..." } - public URL from Supabase Storage.
 * 
 * Requires:
 * - SUPABASE_URL env var
 * - SUPABASE_SERVICE_ROLE_KEY env var
 * - A bucket named "testimonials" in Supabase Storage (create it in dashboard)
 */

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const categoryId = (formData.get("categoryId") as string) || "shared";

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
      return NextResponse.json(
        { error: "Only JPEG, PNG, GIF and WebP images are allowed" },
        { status: 400 }
      );
    }

    if (file.size > MAX_IMAGE_BYTES) {
      return NextResponse.json(
        { error: "Image must be 5MB or smaller" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const safeExt = ["jpg", "jpeg", "png", "gif", "webp"].includes(ext) ? ext : "jpg";
    const filename = `${categoryId}/${randomUUID()}.${safeExt}`;

    // Upload to Supabase Storage bucket "testimonials"
    const { data, error } = await supabase.storage
      .from("testimonials")
      .upload(filename, file, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error("Supabase upload error:", error);
      return NextResponse.json(
        { error: error.message || "Upload failed" },
        { status: 500 }
      );
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("testimonials").getPublicUrl(data.path);

    return NextResponse.json({ url: publicUrl });
  } catch (err) {
    console.error("Upload error:", err);
    if (err instanceof Error && err.message.includes("Missing Supabase credentials")) {
      return NextResponse.json(
        { error: "Storage not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY." },
        { status: 500 }
      );
    }
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
