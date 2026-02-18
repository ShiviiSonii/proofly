import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MediaDisplay } from "@/components/public/MediaDisplay";

type Props = { params: Promise<{ categoryId: string }> };

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) return (value as string[]).join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export default async function EmbedTestimonialsPage({ params }: Props) {
  const { categoryId } = await params;

  const category = await prisma.testimonialCategory.findUnique({
    where: { id: categoryId },
    include: {
      questions: { orderBy: { order: "asc" } },
    },
  });

  if (!category) notFound();

  const testimonials = await prisma.testimonial.findMany({
    where: { categoryId, status: "approved" },
    orderBy: { createdAt: "desc" },
  });

  const questionMap = new Map(
    category.questions.map((q) => [q.id, { label: q.label, type: q.type }])
  );

  return (
    <div className="min-h-screen bg-white p-4 dark:bg-zinc-950">
      <div className="mx-auto max-w-2xl">
        {category.name && (
          <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            {category.name}
          </h2>
        )}
        {testimonials.length === 0 ? (
          <p className="text-sm text-zinc-500">No testimonials yet.</p>
        ) : (
          <ul className="space-y-4">
            {testimonials.map((t) => {
              const data = (t.data as Record<string, unknown>) || {};
              const entries = Object.entries(data).map(([id, value]) => {
                const meta = questionMap.get(id);
                return {
                  id,
                  label: meta?.label ?? id,
                  type: meta?.type ?? "",
                  value: formatValue(value),
                  rawValue: value,
                };
              });
              const name = t.submittedBy || "Anonymous";

              return (
                <li
                  key={t.id}
                  className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900"
                >
                  {entries.map(({ id, label, type, value, rawValue }) =>
                    value || (type === "image" && rawValue) || (type === "video" && rawValue) ? (
                      <div key={id} className="mb-3 last:mb-0">
                        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                          {label}
                        </p>
                        {(type === "image" || type === "video") &&
                        typeof rawValue === "string" ? (
                          <MediaDisplay type={type} value={rawValue} />
                        ) : (
                          <p className="mt-0.5 text-sm text-zinc-800 dark:text-zinc-200">
                            {value}
                          </p>
                        )}
                      </div>
                    ) : null
                  )}
                  <p className="mt-2 border-t border-zinc-200 pt-2 text-xs font-medium text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
                    — {name}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
