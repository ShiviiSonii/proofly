import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { TestimonialStatusActions } from "@/components/dashboard/TestimonialStatusActions";
import { TestimonialFilters } from "@/components/dashboard/TestimonialFilters";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 space-y-3">
          {testimonials.map((testimonial) => {
            const responseCount =
              testimonial.data && typeof testimonial.data === "object" && !Array.isArray(testimonial.data)
                ? Object.keys(testimonial.data as Record<string, unknown>).length
                : 0;

            return (
              <Card
                key={testimonial.id}
                className="border-zinc-200/80 transition-shadow hover:shadow-sm dark:border-zinc-800/80"
              >
                <CardHeader>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="space-y-1">
                      <CardTitle className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        {testimonial.submittedBy || "Anonymous"}
                      </CardTitle>
                      <CardDescription className="text-xs text-zinc-500 dark:text-zinc-400">
                        Submitted {new Date(testimonial.createdAt).toLocaleString()}
                      </CardDescription>
                    </div>
                    <Badge
                      variant={
                        testimonial.status === "approved"
                          ? "default"
                          : testimonial.status === "rejected"
                            ? "destructive"
                            : "secondary"
                      }
                      className="capitalize"
                    >
                      {testimonial.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                    <span className="rounded-md bg-zinc-100 px-2 py-1 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                      Category: {testimonial.category.name}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/submit/${testimonial.category.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-md border border-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    >
                      Open form
                      <ExternalLink className="size-3.5" />
                    </Link>
                    <Link
                      href={`/embed/testimonials/${testimonial.category.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-md border border-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    >
                      Open embed
                      <ExternalLink className="size-3.5" />
                    </Link>
                  </div>

                  <TestimonialStatusActions
                    projectId={id}
                    categoryId={testimonial.category.id}
                    testimonialId={testimonial.id}
                    currentStatus={testimonial.status as "pending" | "approved" | "rejected"}
                  />
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
