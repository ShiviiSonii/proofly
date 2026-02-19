import { auth } from "@/auth";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProjectForm } from "@/components/projects/ProjectForm";
import { DeleteProjectButton } from "@/components/projects/DeleteProjectButton";
import { ApiKeysSection } from "@/components/api-keys/ApiKeysSection";

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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Categories
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Manage testimonial categories and forms for this project.
            </p>
            <p className="mt-2 text-sm text-zinc-500">
              {project._count.categories} categor
              {project._count.categories === 1 ? "y" : "ies"}.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/dashboard/projects/${project.id}/categories/new`}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Add category
            </Link>
            <Link
              href={`/dashboard/projects/${project.id}/categories`}
              className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Manage categories
            </Link>
          </div>
        </div>
      </div>

      <ApiKeysSection projectId={project.id} />

      <DeleteProjectButton projectId={project.id} projectName={project.name} />
    </>
  );
}
