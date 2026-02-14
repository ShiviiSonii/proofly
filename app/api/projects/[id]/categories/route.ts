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

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const result = await getProjectAndCheckOwner(projectId);
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    const categories = await prisma.testimonialCategory.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { questions: true, testimonials: true } },
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Categories list error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const result = await getProjectAndCheckOwner(projectId);
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    const body = await req.json();
    let { name, slug, description } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const slugValue = slug?.trim()
      ? slugify(slug)
      : slugify(name);

    if (!slugValue) {
      return NextResponse.json({ error: "Slug could not be generated from name" }, { status: 400 });
    }

    const existing = await prisma.testimonialCategory.findUnique({
      where: { projectId_slug: { projectId, slug: slugValue } },
    });
    if (existing) {
      return NextResponse.json(
        { error: "A category with this slug already exists in this project" },
        { status: 409 }
      );
    }

    const category = await prisma.testimonialCategory.create({
      data: {
        name: name.trim(),
        slug: slugValue,
        description: description?.trim() || null,
        projectId,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("Category create error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
