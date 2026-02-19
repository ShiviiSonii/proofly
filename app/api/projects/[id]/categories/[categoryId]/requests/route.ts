import { auth } from "@/auth";
import { notFound } from "next/navigation";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendTestimonialRequestEmail } from "@/lib/email";
import { headers } from "next/headers";

type Params = Promise<{ id: string; categoryId: string }>;

/**
 * API endpoint for sending testimonial request emails.
 * 
 * POST /api/projects/[id]/categories/[categoryId]/requests
 * 
 * Body: { email: string, message?: string }
 * 
 * Requires:
 * - User must be authenticated
 * - User must own the project
 * - Category must exist and belong to the project
 * - Resend API key must be configured (RESEND_API_KEY env var)
 */

async function getCategoryAndCheckProject(projectId: string, categoryId: string, userId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project || project.ownerId !== userId) {
    return null;
  }

  const category = await prisma.testimonialCategory.findUnique({
    where: { id: categoryId },
  });

  if (!category || category.projectId !== projectId) {
    return null;
  }

  return { project, category };
}

export async function POST(req: Request, { params }: { params: Params }) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: projectId, categoryId } = await params;

    // Get project and category, verify ownership
    const result = await getCategoryAndCheckProject(projectId, categoryId, session.user.id);
    if (!result) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { project, category } = result;

    // Parse request body
    const body = await req.json();
    const { email, message } = body;

    // Validate email
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    // Build the testimonial submission link
    const headersList = await headers();
    const host = headersList.get("x-forwarded-host") ?? headersList.get("host") ?? "localhost:3000";
    const proto = headersList.get("x-forwarded-proto") ?? "http";
    const baseUrl = host.includes("localhost") ? `http://${host}` : `${proto}://${host}`;
    const link = `${baseUrl}/submit/${encodeURIComponent(categoryId)}`;

    // Send email
    try {
      await sendTestimonialRequestEmail({
        to: email,
        projectName: project.name,
        categoryName: category.name,
        link,
        message: message || undefined,
      });

      return NextResponse.json({ success: true, message: "Email sent successfully" });
    } catch (emailError) {
      console.error("Email sending error:", emailError);
      return NextResponse.json(
        {
          error: emailError instanceof Error ? emailError.message : "Failed to send email",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Request error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
