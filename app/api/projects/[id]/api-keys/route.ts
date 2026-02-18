import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { randomBytes, createHash } from "crypto";

async function getProjectAndCheckOwner(projectId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized", status: 401 as const };

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) return { error: "Project not found", status: 404 as const };
  if (project.ownerId !== session.user.id) return { error: "Forbidden", status: 403 as const };

  return { project, session };
}

function generateApiKeyToken() {
  // 32 bytes -> 64 hex chars, prefixed for clarity
  const raw = randomBytes(32).toString("hex");
  return `pk_${raw}`;
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
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

    const keys = await prisma.apiKey.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
    });

    // Do not return full token hashes; only metadata and last 4 chars (if desired)
    const response = keys.map((k) => ({
      id: k.id,
      name: k.name,
      createdAt: k.createdAt,
      lastUsedAt: k.lastUsedAt,
      revoked: k.revoked,
    }));

    return NextResponse.json(response);
  } catch (error) {
    console.error("API keys list error:", error);
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
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const token = generateApiKeyToken();
    const tokenHash = hashToken(token);

    const apiKey = await prisma.apiKey.create({
      data: {
        userId: result.session.user.id,
        projectId,
        name,
        tokenHash,
      },
    });

    // Return the token once so the user can copy it
    return NextResponse.json(
      {
        id: apiKey.id,
        name: apiKey.name,
        createdAt: apiKey.createdAt,
        token,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("API key create error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

