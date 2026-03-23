import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { TestimonialStatusActions } from "@/components/dashboard/TestimonialStatusActions";
import { TestimonialFilters } from "@/components/dashboard/TestimonialFilters";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

      <Card>
        <CardContent>
          <TestimonialFilters
            projectId={id}
            categories={project.categories}
            initialStatus={status}
            initialCategoryId={selectedCategoryExists ? categoryId : ""}
          />
        </CardContent>
      </Card>

      {testimonials.length === 0 ? (
        <p className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
          No testimonials found.
        </p>
      ) : (
        <div className="space-y-3">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id}>
              <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CardTitle className="text-sm">
                  {testimonial.submittedBy || "Anonymous"}
                </CardTitle>
                <Badge variant={testimonial.status === "approved" ? "default" : testimonial.status === "rejected" ? "destructive" : "secondary"}>
                  {testimonial.status}
                </Badge>
              </div>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
