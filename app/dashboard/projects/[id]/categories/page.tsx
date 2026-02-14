import { auth } from "@/auth";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CategoryCard } from "@/components/categories/CategoryCard";

type Props = { params: Promise<{ id: string }> };

export default async function CategoriesPage({ params }: Props) {
  const session = await auth();
  if (!session?.user) notFound();

  const { id: projectId } = await params;
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project || project.ownerId !== session.user.id) notFound();

  const categories = await prisma.testimonialCategory.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { questions: true, testimonials: true } },
    },
  });

  return (
    <>
      <div className="mb-6">
        <Link
          href={`/dashboard/projects/${projectId}`}
          className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          ← Back to {project.name}
        </Link>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Categories
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Manage testimonial categories and forms for {project.name}.
          </p>
        </div>
        <Link
          href={`/dashboard/projects/${projectId}/categories/new`}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          New category
        </Link>
      </div>

      {categories.length === 0 ? (
        <div className="mt-10 flex flex-col items-center rounded-xl border-2 border-dashed border-zinc-200 py-16 dark:border-zinc-800">
          <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            No categories yet
          </p>
          <p className="mt-1 text-sm text-zinc-500">
            Create a category to set up a testimonial form (e.g. Customer Reviews, Client Feedback).
          </p>
          <Link
            href={`/dashboard/projects/${projectId}/categories/new`}
            className="mt-4 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Create your first category
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              projectId={projectId}
              id={category.id}
              name={category.name}
              slug={category.slug}
              description={category.description}
              isActive={category.isActive}
              questionCount={category._count.questions}
              testimonialCount={category._count.testimonials}
              createdAt={category.createdAt}
            />
          ))}
        </div>
      )}
    </>
  );
}
