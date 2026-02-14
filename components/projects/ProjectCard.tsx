import Link from "next/link";

type ProjectCardProps = {
  id: string;
  name: string;
  description: string | null;
  categoryCount: number;
  createdAt: Date;
};

export function ProjectCard({
  id,
  name,
  description,
  categoryCount,
  createdAt,
}: ProjectCardProps) {
  return (
    <Link
      href={`/dashboard/projects/${id}`}
      className="block rounded-xl border border-zinc-200 bg-white p-5 transition hover:border-zinc-300 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700"
    >
      <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">{name}</h3>
      {description && (
        <p className="mt-1 line-clamp-2 text-sm text-zinc-500 dark:text-zinc-400">
          {description}
        </p>
      )}
      <div className="mt-3 flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
        <span>{categoryCount} categor{categoryCount === 1 ? "y" : "ies"}</span>
        <span>
          {new Date(createdAt).toLocaleDateString()}
        </span>
      </div>
    </Link>
  );
}
