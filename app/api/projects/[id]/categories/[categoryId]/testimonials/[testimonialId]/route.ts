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
  _req: Request,
  { params }: { params: Promise<{ id: string; categoryId: string; testimonialId: string }> }
) {
  try {
    const { id: projectId, categoryId, testimonialId } = await params;
    const result = await getCategoryAndCheckProject(projectId, categoryId);
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    const testimonial = await prisma.testimonial.findUnique({
      where: { id: testimonialId },
    });
    if (!testimonial || testimonial.categoryId !== categoryId) {
      return NextResponse.json({ error: "Testimonial not found" }, { status: 404 });
    }

    return NextResponse.json(testimonial);
  } catch (error) {
    console.error("Testimonial get error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string; categoryId: string; testimonialId: string }> }
) {
  try {
    const { id: projectId, categoryId, testimonialId } = await params;
    const result = await getCategoryAndCheckProject(projectId, categoryId);
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    const testimonial = await prisma.testimonial.findUnique({
      where: { id: testimonialId },
    });
    if (!testimonial || testimonial.categoryId !== categoryId) {
      return NextResponse.json({ error: "Testimonial not found" }, { status: 404 });
    }

    const body = await req.json();
    const { status } = body;
    if (status !== undefined) {
      if (!["pending", "approved", "rejected"].includes(status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }
    }

    const updated = await prisma.testimonial.update({
      where: { id: testimonialId },
      data: { ...(status !== undefined && { status }) },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Testimonial update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; categoryId: string; testimonialId: string }> }
) {
  try {
    const { id: projectId, categoryId, testimonialId } = await params;
    const result = await getCategoryAndCheckProject(projectId, categoryId);
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    const testimonial = await prisma.testimonial.findUnique({
      where: { id: testimonialId },
    });
    if (!testimonial || testimonial.categoryId !== categoryId) {
      return NextResponse.json({ error: "Testimonial not found" }, { status: 404 });
    }

    await prisma.testimonial.delete({ where: { id: testimonialId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Testimonial delete error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
