import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ProjectOverviewPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id },
    select: {
      id: true,
      ownerId: true,
      _count: {
        select: {
          categories: true,
        },
      },
      categories: {
        select: {
          id: true,
          _count: {
            select: { testimonials: true },
          },
          testimonials: {
            select: { status: true },
          },
        },
      },
    },
  });

  if (!project || project.ownerId !== session.user.id) {
    notFound();
  }

  const totalCategories = project._count.categories;
  const totalTestimonials = project.categories.reduce(
    (sum, category) => sum + category._count.testimonials,
    0
  );
  const approvedTestimonials = project.categories.reduce(
    (sum, category) =>
      sum + category.testimonials.filter((testimonial) => testimonial.status === "approved").length,
    0
  );
  const pendingTestimonials = project.categories.reduce(
    (sum, category) =>
      sum + category.testimonials.filter((testimonial) => testimonial.status === "pending").length,
    0
  );
  const rejectedTestimonials = project.categories.reduce(
    (sum, category) =>
      sum + category.testimonials.filter((testimonial) => testimonial.status === "rejected").length,
    0
  );

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Overview</h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Default project page with high-level stats.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Categories</p>
          <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-50">{totalCategories}</p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Total Testimonials</p>
          <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-50">{totalTestimonials}</p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Approved</p>
          <p className="mt-1 text-2xl font-bold text-green-600 dark:text-green-400">{approvedTestimonials}</p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Pending</p>
          <p className="mt-1 text-2xl font-bold text-amber-600 dark:text-amber-400">{pendingTestimonials}</p>
        </div>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Status Breakdown</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <div className="rounded-md border border-zinc-200 p-3 dark:border-zinc-800">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Approved</p>
            <p className="mt-1 text-lg font-semibold text-green-600 dark:text-green-400">
              {approvedTestimonials}
            </p>
          </div>
          <div className="rounded-md border border-zinc-200 p-3 dark:border-zinc-800">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Pending</p>
            <p className="mt-1 text-lg font-semibold text-amber-600 dark:text-amber-400">
              {pendingTestimonials}
            </p>
          </div>
          <div className="rounded-md border border-zinc-200 p-3 dark:border-zinc-800">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Rejected</p>
            <p className="mt-1 text-lg font-semibold text-red-600 dark:text-red-400">
              {rejectedTestimonials}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
