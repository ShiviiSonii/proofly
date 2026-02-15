import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { TestimonialForm } from "@/components/public/TestimonialForm";

type Props = { params: Promise<{ categoryId: string }> };

export default async function PublicTestimonialPage({ params }: Props) {
  const { categoryId } = await params;

  const category = await prisma.testimonialCategory.findUnique({
    where: { id: categoryId },
    include: {
      questions: {
        orderBy: { order: "asc" },
      },
    },
  });

  if (!category || !category.isActive) notFound();

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-12 dark:bg-zinc-950">
      <div className="mx-auto max-w-lg">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Share your feedback
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Your testimonial helps us improve.
          </p>
        </div>
        <TestimonialForm
          category={{
            id: category.id,
            name: category.name,
            description: category.description,
            slug: category.slug,
          }}
          questions={category.questions.map((q) => ({
            id: q.id,
            label: q.label,
            type: q.type,
            required: q.required,
            placeholder: q.placeholder,
            options: q.options,
            validation: q.validation,
          }))}
        />
      </div>
    </div>
  );
}
