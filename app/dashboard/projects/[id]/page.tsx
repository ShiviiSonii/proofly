import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
        <Card>
          <CardHeader>
            <CardDescription>Categories</CardDescription>
            <CardTitle>{totalCategories}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Total Testimonials</CardDescription>
            <CardTitle>{totalTestimonials}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Approved</CardDescription>
            <CardTitle>{approvedTestimonials}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Pending</CardDescription>
            <CardTitle>{pendingTestimonials}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Status Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          <div className="flex items-center justify-between rounded-md border p-3">
            <span>Approved</span>
            <Badge>{approvedTestimonials}</Badge>
          </div>
          <div className="flex items-center justify-between rounded-md border p-3">
            <span>Pending</span>
            <Badge variant="secondary">{pendingTestimonials}</Badge>
          </div>
          <div className="flex items-center justify-between rounded-md border p-3">
            <span>Rejected</span>
            <Badge variant="destructive">{rejectedTestimonials}</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
