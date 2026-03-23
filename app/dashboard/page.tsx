import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ProjectsDashboard } from "@/components/dashboard/ProjectsDashboard";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const projects = await prisma.project.findMany({
    where: { ownerId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { categories: true } } },
  });

  const initialProjects = projects.map((project) => ({
    id: project.id,
    name: project.name,
    description: project.description,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
    categoriesCount: project._count.categories,
  }));

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-10 dark:bg-zinc-950">
      <div className="mx-auto w-full max-w-5xl">
        <ProjectsDashboard
          initialProjects={initialProjects}
          userName={session.user.name ?? "there"}
        />
      </div>
    </div>
  );
}
