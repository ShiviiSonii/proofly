import { auth } from "@/auth";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProjectForm } from "@/components/projects/ProjectForm";
import { DeleteProjectButton } from "@/components/projects/DeleteProjectButton";

type Props = { params: Promise<{ id: string }> };

export default async function ProjectDetailPage({ params }: Props) {
  const session = await auth();
  if (!session?.user) notFound();

  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      _count: { select: { categories: true } },
    },
  });

  if (!project || project.ownerId !== session.user.id) notFound();

  return (
    <>
      <div className="mb-6">
        <Link
          href="/dashboard/projects"
          className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          ← Back to projects
        </Link>
      </div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            {project.name}
          </h1>
          {project.description && (
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {project.description}
            </p>
          )}
          <p className="mt-2 text-sm text-zinc-500">
            {project._count.categories} categor
            {project._count.categories === 1 ? "y" : "ies"}
          </p>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Edit project
        </h2>
        <div className="mt-4">
          <ProjectForm
            mode="edit"
            projectId={project.id}
            defaultName={project.name}
            defaultDescription={project.description ?? ""}
          />
        </div>
      </div>

      <div className="mt-10 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Categories
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Categories and form builder will be available in the next phase.
        </p>
        <p className="mt-2 text-sm text-zinc-500">
          This project has {project._count.categories} categor
          {project._count.categories === 1 ? "y" : "ies"}.
        </p>
      </div>

      <DeleteProjectButton projectId={project.id} projectName={project.name} />
    </>
  );
}
