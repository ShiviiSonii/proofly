import { auth } from "@/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProjectCard } from "@/components/projects/ProjectCard";

export default async function ProjectsPage() {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");

  const projects = await prisma.project.findMany({
    where: { ownerId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { categories: true } },
    },
  });

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Projects
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Manage your testimonial projects and categories.
          </p>
        </div>
        <Link
          href="/dashboard/projects/new"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          New project
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="mt-10 flex flex-col items-center rounded-xl border-2 border-dashed border-zinc-200 py-16 dark:border-zinc-800">
          <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            No projects yet
          </p>
          <p className="mt-1 text-sm text-zinc-500">
            Create a project to start collecting testimonials.
          </p>
          <Link
            href="/dashboard/projects/new"
            className="mt-4 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Create your first project
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              id={project.id}
              name={project.name}
              description={project.description}
              categoryCount={project._count.categories}
              createdAt={project.createdAt}
            />
          ))}
        </div>
      )}
    </>
  );
}
