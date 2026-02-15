import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function getCategoryAndCheckProject(projectId: string, categoryId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized", status: 401 as const };

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) return { error: "Project not found", status: 404 as const };
  if (project.ownerId !== session.user.id) return { error: "Forbidden", status: 403 as const };

  const category = await prisma.testimonialCategory.findUnique({
    where: { id: categoryId },
  });
  if (!category) return { error: "Category not found", status: 404 as const };
  if (category.projectId !== projectId) return { error: "Category not found", status: 404 as const };

  return { category, session };
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string; categoryId: string }> }
) {
  try {
    const { id: projectId, categoryId } = await params;
    const result = await getCategoryAndCheckProject(projectId, categoryId);
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status"); // pending | approved | rejected | null (all)

    const where: { categoryId: string; status?: string } = { categoryId };
    if (status === "pending" || status === "approved" || status === "rejected") {
      where.status = status;
    }

    const testimonials = await prisma.testimonial.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(testimonials);
  } catch (error) {
    console.error("Testimonials list error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
