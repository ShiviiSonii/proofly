import Link from "next/link";
import { auth } from "@/auth";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CategoryForm } from "@/components/categories/CategoryForm";

type Props = { params: Promise<{ id: string }> };

export default async function NewCategoryPage({ params }: Props) {
  const session = await auth();
  if (!session?.user) notFound();

  const { id: projectId } = await params;
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project || project.ownerId !== session.user.id) notFound();

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
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        New category
      </h1>
      <p className="mt-1 text-sm text-zinc-500">
        Create a category to collect testimonials (e.g. Customer Reviews). You can add form questions in the next step.
      </p>
      <div className="mt-8">
        <CategoryForm projectId={projectId} mode="create" />
      </div>
    </>
  );
}
