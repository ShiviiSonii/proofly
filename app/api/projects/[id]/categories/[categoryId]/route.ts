import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";

async function getProjectAndCheckOwner(projectId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized", status: 401 as const };

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) return { error: "Project not found", status: 404 as const };
  if (project.ownerId !== session.user.id) return { error: "Forbidden", status: 403 as const };

  return { project, session };
}

async function getCategoryAndCheckProject(
  projectId: string,
  categoryId: string
) {
  const result = await getProjectAndCheckOwner(projectId);
  if ("error" in result) return result;

  const category = await prisma.testimonialCategory.findUnique({
    where: { id: categoryId },
  });
  if (!category) return { error: "Category not found", status: 404 as const };
  if (category.projectId !== projectId) return { error: "Category not found", status: 404 as const };

  return { category, ...result };
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string; categoryId: string }> }
) {
  try {
    const { id: projectId, categoryId } = await params;
    const result = await getCategoryAndCheckProject(projectId, categoryId);
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    const category = await prisma.testimonialCategory.findUnique({
      where: { id: categoryId },
      include: {
        _count: { select: { questions: true, testimonials: true } },
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error("Category get error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string; categoryId: string }> }
) {
  try {
    const { id: projectId, categoryId } = await params;
    const result = await getCategoryAndCheckProject(projectId, categoryId);
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    const body = await req.json();
    let { name, slug, description, isActive } = body;

    const data: { name?: string; slug?: string; description?: string | null; isActive?: boolean } = {};

    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        return NextResponse.json({ error: "Name must be a non-empty string" }, { status: 400 });
      }
      data.name = name.trim();
    }

    if (slug !== undefined) {
      const slugValue = typeof slug === "string" && slug.trim() ? slugify(slug.trim()) : (name != null ? slugify(name) : result.category.slug);
      const existing = await prisma.testimonialCategory.findUnique({
        where: { projectId_slug: { projectId, slug: slugValue } },
      });
      if (existing && existing.id !== categoryId) {
        return NextResponse.json(
          { error: "A category with this slug already exists in this project" },
          { status: 409 }
        );
      }
      data.slug = slugValue;
    }

    if (description !== undefined) data.description = description?.trim() || null;
    if (typeof isActive === "boolean") data.isActive = isActive;

    const category = await prisma.testimonialCategory.update({
      where: { id: categoryId },
      data,
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error("Category update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; categoryId: string }> }
) {
  try {
    const { id: projectId, categoryId } = await params;
    const result = await getCategoryAndCheckProject(projectId, categoryId);
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    await prisma.testimonialCategory.delete({ where: { id: categoryId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Category delete error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
