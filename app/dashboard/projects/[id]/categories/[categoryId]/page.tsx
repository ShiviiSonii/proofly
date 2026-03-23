import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CategoryFormsManager } from "@/components/dashboard/CategoryFormsManager";

type Props = {
  params: Promise<{ id: string; categoryId: string }>;
};

export default async function CategoryFormsPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const { id, categoryId } = await params;

  const project = await prisma.project.findUnique({
    where: { id },
    select: { ownerId: true },
  });

  if (!project || project.ownerId !== session.user.id) {
    notFound();
  }

  const category = await prisma.testimonialCategory.findUnique({
    where: { id: categoryId },
    include: {
      questions: {
        orderBy: { order: "asc" },
      },
    },
  });

  if (!category || category.projectId !== id) {
    notFound();
  }

  return (
    <CategoryFormsManager
      projectId={id}
      categoryId={category.id}
      categoryName={category.name}
      initialQuestions={category.questions}
    />
  );
}
