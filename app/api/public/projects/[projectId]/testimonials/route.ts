import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createHash } from "crypto";

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

type Params = { projectId: string };

export async function GET(
  req: Request,
  { params }: { params: Promise<Params> }
) {
  try {
    const { projectId } = await params;
    const url = new URL(req.url);
    const status = url.searchParams.get("status") || "approved";
    const categoryId = url.searchParams.get("categoryId") || undefined;
    const limitParam = url.searchParams.get("limit");
    const cursor = url.searchParams.get("cursor") || undefined;

    const limit = Math.min(Math.max(Number(limitParam) || 20, 1), 50);

    // Read API key from header or query param
    const apiKey = req.headers.get("x-proofly-api-key") || url.searchParams.get("apiKey");
    if (!apiKey) {
      return NextResponse.json({ error: "API key required" }, { status: 401 });
    }

    const tokenHash = hashToken(apiKey);

    const key = await prisma.apiKey.findFirst({
      where: {
        tokenHash,
        projectId,
        revoked: false,
      },
    });

    if (!key) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
    }

    // Update lastUsedAt (fire and forget)
    prisma.apiKey
      .update({
        where: { id: key.id },
        data: { lastUsedAt: new Date() },
      })
      .catch(() => {});

    const where: {
      status?: string;
      categoryId?: string;
      category?: { projectId: string };
    } = {
      category: { projectId },
    };

    if (status) {
      where.status = status;
    }
    if (categoryId) {
      where.categoryId = categoryId;
    }

    const testimonials = await prisma.testimonial.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            projectId: true,
            questions: {
              select: {
                id: true,
                label: true,
                type: true,
                order: true,
              },
              orderBy: { order: "asc" },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit + 1,
      ...(cursor
        ? {
            skip: 1,
            cursor: { id: cursor },
          }
        : {}),
    });

    let nextCursor: string | null = null;
    if (testimonials.length > limit) {
      const next = testimonials.pop();
      if (next) nextCursor = next.id;
    }

    const data = testimonials.map((t) => ({
      id: t.id,
      projectId: t.category.projectId,
      category: {
        id: t.category.id,
        name: t.category.name,
        questions: t.category.questions,
      },
      status: t.status,
      submittedBy: t.submittedBy,
      createdAt: t.createdAt,
      data: t.data,
    }));

    return NextResponse.json({
      items: data,
      nextCursor,
    });
  } catch (error) {
    console.error("Public testimonials API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

