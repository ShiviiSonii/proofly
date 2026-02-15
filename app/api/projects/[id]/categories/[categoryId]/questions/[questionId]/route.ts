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
  { params }: { params: Promise<{ id: string; categoryId: string; questionId: string }> }
) {
  try {
    const { id: projectId, categoryId, questionId } = await params;
    const result = await getCategoryAndCheckProject(projectId, categoryId);
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    const question = await prisma.formQuestion.findUnique({
      where: { id: questionId },
    });
    if (!question || question.categoryId !== categoryId) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    return NextResponse.json(question);
  } catch (error) {
    console.error("Question get error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string; categoryId: string; questionId: string }> }
) {
  try {
    const { id: projectId, categoryId, questionId } = await params;
    const result = await getCategoryAndCheckProject(projectId, categoryId);
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    const existing = await prisma.formQuestion.findUnique({
      where: { id: questionId },
    });
    if (!existing || existing.categoryId !== categoryId) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    const body = await req.json();
    const { label, type, required, order, placeholder, options, validation } = body;

    const data: {
      label?: string;
      type?: string;
      required?: boolean;
      order?: number;
      placeholder?: string | null;
      options?: unknown;
      validation?: unknown;
    } = {};

    if (label !== undefined) {
      if (typeof label !== "string" || !label.trim()) {
        return NextResponse.json({ error: "Label must be a non-empty string" }, { status: 400 });
      }
      data.label = label.trim();
    }
    if (type !== undefined) {
      if (!QUESTION_TYPES.includes(type)) {
        return NextResponse.json(
          { error: `Type must be one of: ${QUESTION_TYPES.join(", ")}` },
          { status: 400 }
        );
      }
      data.type = type;
    }
    if (typeof required === "boolean") data.required = required;
    if (typeof order === "number") data.order = order;
    if (placeholder !== undefined) data.placeholder = placeholder?.trim() || null;
    if (options !== undefined) data.options = options;
    if (validation !== undefined) data.validation = validation;

    const question = await prisma.formQuestion.update({
      where: { id: questionId },
      data,
    });

    return NextResponse.json(question);
  } catch (error) {
    console.error("Question update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; categoryId: string; questionId: string }> }
) {
  try {
    const { id: projectId, categoryId, questionId } = await params;
    const result = await getCategoryAndCheckProject(projectId, categoryId);
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    const question = await prisma.formQuestion.findUnique({
      where: { id: questionId },
    });
    if (!question || question.categoryId !== categoryId) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    await prisma.formQuestion.delete({ where: { id: questionId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Question delete error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
