"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type ProjectSidebarProps = {
  projectId: string;
};

const navItems = [
  { label: "Overview", href: "" },
  { label: "Categories", href: "/categories" },
  { label: "Testimonials", href: "/testimonials" },
  { label: "API Keys", href: "/api-keys" },
];

export function ProjectSidebar({ projectId }: ProjectSidebarProps) {
  const pathname = usePathname();
  const basePath = `/dashboard/projects/${projectId}`;

  return (
    <aside className="w-full rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950 lg:w-64 lg:shrink-0">
      <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        Project
      </p>
      <nav className="space-y-1">
        {navItems.map((item) => {
          const fullPath = `${basePath}${item.href}`;
          const isActive = pathname === fullPath;
          return (
            <Link
              key={item.label}
              href={fullPath}
              className={`block rounded-lg px-3 py-2 text-sm transition ${
                isActive
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
