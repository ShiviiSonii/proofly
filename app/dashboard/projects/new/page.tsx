import Link from "next/link";
import { ProjectForm } from "@/components/projects/ProjectForm";

export default function NewProjectPage() {
  return (
    <>
      <div className="mb-6">
        <Link
          href="/dashboard/projects"
          className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          ← Back to projects
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        New project
      </h1>
      <p className="mt-1 text-sm text-zinc-500">
        Create a project to organize testimonial categories and forms.
      </p>
      <div className="mt-8">
        <ProjectForm mode="create" />
      </div>
    </>
  );
}
