import { auth } from "@/auth";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { TestimonialCard } from "@/components/testimonials/TestimonialCard";
import { TestimonialsFilter } from "@/components/testimonials/TestimonialsFilter";

type Props = {
  params: Promise<{ id: string; categoryId: string }>;
  searchParams: Promise<{ status?: string }>;
};

export default async function TestimonialsPage({ params, searchParams }: Props) {
  const session = await auth();
  if (!session?.user) notFound();

  const { id: projectId, categoryId } = await params;
  const { status: statusFilter } = await searchParams;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });
  if (!project || project.ownerId !== session.user.id) notFound();

  const category = await prisma.testimonialCategory.findUnique({
    where: { id: categoryId },
    include: {
      questions: { orderBy: { order: "asc" } },
    },
  });
  if (!category || category.projectId !== projectId) notFound();

  const where: { categoryId: string; status?: string } = { categoryId };
  if (statusFilter === "pending" || statusFilter === "approved" || statusFilter === "rejected") {
    where.status = statusFilter;
  }

  const testimonials = await prisma.testimonial.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  const counts = await prisma.testimonial.groupBy({
    by: ["status"],
    where: { categoryId },
    _count: true,
  });
  const countByStatus = Object.fromEntries(
    counts.map((c) => [c.status, c._count])
  ) as Record<string, number>;

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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Testimonials
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Manage submissions for &quot;{category.name}&quot;.
          </p>
        </div>
      </div>

      <TestimonialsFilter
        projectId={projectId}
        categoryId={categoryId}
        currentStatus={statusFilter}
        counts={countByStatus}
      />

      {testimonials.length === 0 ? (
        <div className="mt-8 rounded-xl border-2 border-dashed border-zinc-200 py-12 text-center dark:border-zinc-800">
          <p className="text-zinc-500">
            {statusFilter
              ? `No ${statusFilter} testimonials.`
              : "No testimonials yet. Share the form link to collect submissions."}
          </p>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {testimonials.map((t) => (
            <li key={t.id}>
              <TestimonialCard
                projectId={projectId}
                categoryId={categoryId}
                testimonial={{
                  id: t.id,
                  data: t.data as Record<string, unknown>,
                  status: t.status,
                  submittedBy: t.submittedBy,
                  createdAt: t.createdAt.toISOString(),
                }}
                questions={category.questions.map((q) => ({ id: q.id, label: q.label, type: q.type }))}
              />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
