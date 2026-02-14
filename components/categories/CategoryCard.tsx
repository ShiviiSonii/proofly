import Link from "next/link";

type CategoryCardProps = {
  projectId: string;
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  questionCount: number;
  testimonialCount: number;
  createdAt: Date;
};

export function CategoryCard({
  projectId,
  id,
  name,
  slug,
  description,
  isActive,
  questionCount,
  testimonialCount,
  createdAt,
}: CategoryCardProps) {
  return (
    <Link
      href={`/dashboard/projects/${projectId}/categories/${id}`}
      className="block rounded-xl border border-zinc-200 bg-white p-5 transition hover:border-zinc-300 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">{name}</h3>
        {!isActive && (
          <span className="rounded bg-zinc-200 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400">
            Inactive
          </span>
        )}
      </div>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        /{slug}
      </p>
      {description && (
        <p className="mt-2 line-clamp-2 text-sm text-zinc-500 dark:text-zinc-400">
          {description}
        </p>
      )}
      <div className="mt-3 flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
        <span>{questionCount} question{questionCount !== 1 ? "s" : ""}</span>
        <span>{testimonialCount} testimonial{testimonialCount !== 1 ? "s" : ""}</span>
        <span>{new Date(createdAt).toLocaleDateString()}</span>
      </div>
    </Link>
  );
}
