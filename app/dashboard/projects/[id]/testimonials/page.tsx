import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { TestimonialStatusActions } from "@/components/dashboard/TestimonialStatusActions";

type Props = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{
    status?: string;
    categoryId?: string;
  }>;
};

const ALLOWED_STATUS = ["pending", "approved", "rejected"] as const;

export default async function ProjectTestimonialsPage({ params, searchParams }: Props) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const { id } = await params;
  const query = (await searchParams) ?? {};
  const status =
    query.status && ALLOWED_STATUS.includes(query.status as (typeof ALLOWED_STATUS)[number])
      ? query.status
      : "";
  const categoryId = query.categoryId?.trim() || "";

  const project = await prisma.project.findUnique({
    where: { id },
    select: {
      ownerId: true,
      categories: {
        select: { id: true, name: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!project || project.ownerId !== session.user.id) {
    notFound();
  }

  const selectedCategoryExists = categoryId
    ? project.categories.some((category) => category.id === categoryId)
    : false;

  const testimonials = await prisma.testimonial.findMany({
    where: {
      category: {
        projectId: id,
        ...(selectedCategoryExists ? { id: categoryId } : {}),
      },
      ...(status ? { status } : {}),
    },
    include: {
      category: {
        select: { id: true, name: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Testimonials</h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Latest testimonials across all categories.
        </p>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <form className="grid gap-3 sm:grid-cols-3">
          <div>
            <label htmlFor="status" className="block text-xs font-medium text-zinc-600 dark:text-zinc-300">
              Status
            </label>
            <select
              id="status"
              name="status"
              defaultValue={status}
              className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
            >
              <option value="">All statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label htmlFor="categoryId" className="block text-xs font-medium text-zinc-600 dark:text-zinc-300">
              Category
            </label>
            <select
              id="categoryId"
              name="categoryId"
              defaultValue={selectedCategoryExists ? categoryId : ""}
              className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
            >
              <option value="">All categories</option>
              {project.categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Apply filters
            </button>
            <Link
              href={`/dashboard/projects/${id}/testimonials`}
              className="rounded-md border border-zinc-300 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Clear
            </Link>
          </div>
        </form>
      </div>

      {testimonials.length === 0 ? (
        <p className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
          No testimonials found.
        </p>
      ) : (
        <div className="space-y-3">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  {testimonial.submittedBy || "Anonymous"}
                </p>
                <span className="text-xs capitalize text-zinc-500 dark:text-zinc-400">
                  {testimonial.status}
                </span>
              </div>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Category: {testimonial.category.name}{" "}
                <Link
                  href={`/submit/${testimonial.category.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline dark:text-blue-400"
                >
                  (actual form)
                </Link>
                {" "}
                <Link
                  href={`/embed/testimonials/${testimonial.category.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline dark:text-blue-400"
                >
                  (embed preview)
                </Link>
              </p>
              <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                Submitted: {new Date(testimonial.createdAt).toLocaleString()}
              </p>
              <TestimonialStatusActions
                projectId={id}
                categoryId={testimonial.category.id}
                testimonialId={testimonial.id}
                currentStatus={testimonial.status as "pending" | "approved" | "rejected"}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
