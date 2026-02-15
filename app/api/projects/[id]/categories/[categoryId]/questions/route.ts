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

const QUESTION_TYPES = ["text", "textarea", "email", "number", "rating", "dropdown", "checkbox", "radio"] as const;

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

    const questions = await prisma.formQuestion.findMany({
      where: { categoryId },
      orderBy: { order: "asc" },
    });

    return NextResponse.json(questions);
  } catch (error) {
    console.error("Questions list error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
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
    const { label, type, required, placeholder, options, validation } = body;

    if (!label || typeof label !== "string" || !label.trim()) {
      return NextResponse.json({ error: "Label is required" }, { status: 400 });
    }
    if (!type || !QUESTION_TYPES.includes(type)) {
      return NextResponse.json(
        { error: `Type must be one of: ${QUESTION_TYPES.join(", ")}` },
        { status: 400 }
      );
    }

    const count = await prisma.formQuestion.count({ where: { categoryId } });
    const order = typeof body.order === "number" ? body.order : count;

    const question = await prisma.formQuestion.create({
      data: {
        categoryId,
        label: label.trim(),
        type,
        required: Boolean(required),
        order,
        placeholder: placeholder?.trim() || null,
        options: options ?? null,
        validation: validation ?? null,
      },
    });

    return NextResponse.json(question, { status: 201 });
  } catch (error) {
    console.error("Question create error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
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
    const { questionIds } = body;
    if (!Array.isArray(questionIds) || questionIds.length === 0) {
      return NextResponse.json({ error: "questionIds array is required" }, { status: 400 });
    }

    await prisma.$transaction(
      questionIds.map((qId: string, index: number) =>
        prisma.formQuestion.updateMany({
          where: { id: qId, categoryId },
          data: { order: index },
        })
      )
    );

    const questions = await prisma.formQuestion.findMany({
      where: { categoryId },
      orderBy: { order: "asc" },
    });
    return NextResponse.json(questions);
  } catch (error) {
    console.error("Questions reorder error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
