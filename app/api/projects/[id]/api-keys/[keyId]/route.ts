import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function getProjectAndCheckOwner(projectId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized", status: 401 as const };

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) return { error: "Project not found", status: 404 as const };
  if (project.ownerId !== session.user.id) return { error: "Forbidden", status: 403 as const };

  return { project, session };
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; keyId: string }> }
) {
  try {
    const { id: projectId, keyId } = await params;
    const result = await getProjectAndCheckOwner(projectId);
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    const existing = await prisma.apiKey.findUnique({ where: { id: keyId } });
    if (!existing || existing.projectId !== projectId) {
      return NextResponse.json({ error: "API key not found" }, { status: 404 });
    }

    await prisma.apiKey.update({
      where: { id: keyId },
      data: { revoked: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API key revoke error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

