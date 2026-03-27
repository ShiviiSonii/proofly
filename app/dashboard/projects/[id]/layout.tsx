import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ProjectWorkspaceShell } from "@/components/dashboard/ProjectWorkspaceShell";

type Props = {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
};

export default async function ProjectLayout({ children, params }: Props) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id },
    select: { id: true, name: true, ownerId: true, description: true },
  });
  const projects = await prisma.project.findMany({
    where: { ownerId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true },
  });

  if (!project || project.ownerId !== session.user.id) {
    notFound();
  }

  return (
    <ProjectWorkspaceShell
      projectId={project.id}
      projects={projects}
      userName={session.user.name ?? "User"}
      userEmail={session.user.email ?? "No email"}
    >
      {children}
    </ProjectWorkspaceShell>
  );
}
