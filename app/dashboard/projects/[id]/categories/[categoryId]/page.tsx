import { auth } from "@/auth";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CategoryForm } from "@/components/categories/CategoryForm";
import { DeleteCategoryButton } from "@/components/categories/DeleteCategoryButton";

type Props = { params: Promise<{ id: string; categoryId: string }> };

export default async function CategoryDetailPage({ params }: Props) {
  const session = await auth();
  if (!session?.user) notFound();

  const { id: projectId, categoryId } = await params;
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project || project.ownerId !== session.user.id) notFound();

  const category = await prisma.testimonialCategory.findUnique({
    where: { id: categoryId },
    include: {
      _count: { select: { questions: true, testimonials: true } },
    },
  });

  if (!category || category.projectId !== projectId) notFound();

  return (
    <>
      <div className="mb-6">
        <Link
          href={`/dashboard/projects/${projectId}/categories`}
          className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          ← Back to categories
        </Link>
      </div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            {category.name}
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            /{category.slug}
          </p>
          {category.description && (
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              {category.description}
            </p>
          )}
          <div className="mt-2 flex items-center gap-4 text-sm text-zinc-500">
            <span>{category._count.questions} questions</span>
            <span>{category._count.testimonials} testimonials</span>
            {!category.isActive && (
              <span className="rounded bg-zinc-200 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400">
                Inactive
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Edit category
        </h2>
        <div className="mt-4">
          <CategoryForm
            mode="edit"
            projectId={projectId}
            categoryId={category.id}
            defaultName={category.name}
            defaultSlug={category.slug}
            defaultDescription={category.description ?? ""}
          />
        </div>
      </div>

      <div className="mt-10 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Form setup
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Add and reorder form questions in the next phase.
        </p>
        <p className="mt-2 text-sm text-zinc-500">
          This category has {category._count.questions} question
          {category._count.questions === 1 ? "" : "s"}.
        </p>
      </div>

      <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Testimonials
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          View and manage submitted testimonials in a later phase.
        </p>
        <p className="mt-2 text-sm text-zinc-500">
          {category._count.testimonials} testimonial
          {category._count.testimonials === 1 ? "" : "s"} submitted.
        </p>
      </div>

      <DeleteCategoryButton
        projectId={projectId}
        categoryId={category.id}
        categoryName={category.name}
      />
    </>
  );
}
