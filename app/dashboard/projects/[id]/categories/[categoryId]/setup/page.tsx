import { auth } from "@/auth";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { QuestionList } from "@/components/questions/QuestionList";

type Props = { params: Promise<{ id: string; categoryId: string }> };

export default async function FormSetupPage({ params }: Props) {
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
      _count: { select: { questions: true } },
    },
  });

  if (!category || category.projectId !== projectId) notFound();

  return (
    <>
      <div className="mb-6">
        <Link
          href={`/dashboard/projects/${projectId}/categories/${categoryId}`}
          className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          ← Back to {category.name}
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        Form setup
      </h1>
      <p className="mt-1 text-sm text-zinc-500">
        Add and reorder questions for the testimonial form. This is what respondents will see when they submit a testimonial for &quot;{category.name}&quot;.
      </p>

      <div className="mt-8">
        <QuestionList projectId={projectId} categoryId={categoryId} />
      </div>
    </>
  );
}
