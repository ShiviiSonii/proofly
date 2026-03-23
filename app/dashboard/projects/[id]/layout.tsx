import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ProjectSidebar } from "@/components/dashboard/ProjectSidebar";

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

  if (!project || project.ownerId !== session.user.id) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-8 dark:bg-zinc-950">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Project Workspace
            </p>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{project.name}</h1>
            {project.description && (
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">{project.description}</p>
            )}
          </div>
          <Link
            href="/dashboard"
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Back to projects
          </Link>
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
          <ProjectSidebar projectId={project.id} />
          <main className="min-w-0 flex-1 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
