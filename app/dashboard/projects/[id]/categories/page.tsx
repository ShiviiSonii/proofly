import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CategoriesManager } from "@/components/dashboard/CategoriesManager";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ProjectCategoriesPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id },
    select: {
      ownerId: true,
      categories: {
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { questions: true, testimonials: true } },
        },
      },
    },
  });

  if (!project || project.ownerId !== session.user.id) {
    notFound();
  }

  const initialCategories = project.categories.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    isActive: category.isActive,
    questionsCount: category._count.questions,
    testimonialsCount: category._count.testimonials,
  }));

  return <CategoriesManager projectId={id} initialCategories={initialCategories} />;
}
