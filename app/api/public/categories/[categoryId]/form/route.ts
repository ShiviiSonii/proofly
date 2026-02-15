import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  try {
    const { categoryId } = await params;

    const category = await prisma.testimonialCategory.findUnique({
      where: { id: categoryId },
      include: {
        questions: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!category) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }
    if (!category.isActive) {
      return NextResponse.json({ error: "Form is not accepting submissions" }, { status: 404 });
    }

    return NextResponse.json({
      category: {
        id: category.id,
        name: category.name,
        description: category.description,
        slug: category.slug,
      },
      questions: category.questions.map((q) => ({
        id: q.id,
        label: q.label,
        type: q.type,
        required: q.required,
        placeholder: q.placeholder,
        options: q.options,
        validation: q.validation,
      })),
    });
  } catch (error) {
    console.error("Public form get error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
