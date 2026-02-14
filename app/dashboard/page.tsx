import { auth } from "@/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");

  const user = session.user;
  const projectCount = await prisma.project.count({
    where: { ownerId: session.user.id },
  });
  const testimonialCount = await prisma.testimonial.count();

  return (
    <>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        Dashboard
      </h1>
      <p className="mt-1 text-sm text-zinc-500">Welcome back, {user.name}!</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-sm text-zinc-500">Projects</p>
          <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            {projectCount}
          </p>
          <Link
            href="/dashboard/projects"
            className="mt-2 inline-block text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            View projects →
          </Link>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-sm text-zinc-500">Total Testimonials</p>
          <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            {testimonialCount}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-sm text-zinc-500">Pending</p>
          <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            0
          </p>
        </div>
      </div>

      <div className="mt-10 flex flex-col items-center rounded-xl border-2 border-dashed border-zinc-200 py-16 dark:border-zinc-800">
        <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          {projectCount === 0 ? "No projects yet" : "Manage your projects"}
        </p>
        <p className="mt-1 text-sm text-zinc-500">
          {projectCount === 0
            ? "Create a project to start collecting testimonials."
            : "Add categories and forms to collect testimonials."}
        </p>
        <Link
          href="/dashboard/projects/new"
          className="mt-4 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {projectCount === 0 ? "Create your first project" : "New project"}
        </Link>
      </div>
    </>
  );
}
