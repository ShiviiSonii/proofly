"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Project = {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  categoriesCount: number;
};

type ProjectsDashboardProps = {
  initialProjects: Project[];
  userName: string;
};

type ApiProject = {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    categories?: number;
  };
};

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString();
}

function toProject(apiProject: ApiProject): Project {
  return {
    id: apiProject.id,
    name: apiProject.name,
    description: apiProject.description,
    createdAt: apiProject.createdAt,
    updatedAt: apiProject.updatedAt,
    categoriesCount: apiProject._count?.categories ?? 0,
  };
}

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl border border-zinc-200 bg-white p-5 shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-1 text-sm text-zinc-500 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function ProjectsDashboard({ initialProjects, userName }: ProjectsDashboardProps) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const [createName, setCreateName] = useState("");
  const [createDescription, setCreateDescription] = useState("");

  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const projectCountLabel = useMemo(() => {
    if (projects.length === 1) return "1 project";
    return `${projects.length} projects`;
  }, [projects.length]);

  async function refreshProjects() {
    const res = await fetch("/api/projects");
    if (!res.ok) {
      throw new Error("Failed to load projects");
    }
    const data = (await res.json()) as ApiProject[];
    setProjects(data.map(toProject));
  }

  function resetCreateState() {
    setCreateName("");
    setCreateDescription("");
  }

  function openEditModal(project: Project) {
    setSelectedProject(project);
    setEditName(project.name);
    setEditDescription(project.description ?? "");
    setIsEditOpen(true);
  }

  function openDeleteModal(project: Project) {
    setSelectedProject(project);
    setIsDeleteOpen(true);
  }

  async function handleCreateProject(e: React.FormEvent) {
    e.preventDefault();
    if (!createName.trim()) {
      setError("Project name is required.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: createName.trim(),
          description: createDescription.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create project.");
        return;
      }

      await refreshProjects();
      setIsCreateOpen(false);
      resetCreateState();
    } catch {
      setError("Failed to create project.");
    } finally {
      setLoading(false);
    }
  }

  async function handleEditProject(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedProject) return;
    if (!editName.trim()) {
      setError("Project name is required.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/projects/${selectedProject.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim(),
          description: editDescription.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to update project.");
        return;
      }

      await refreshProjects();
      setIsEditOpen(false);
      setSelectedProject(null);
    } catch {
      setError("Failed to update project.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteProject() {
    if (!selectedProject) return;

    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/projects/${selectedProject.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to delete project.");
        return;
      }

      await refreshProjects();
      setIsDeleteOpen(false);
      setSelectedProject(null);
    } catch {
      setError("Failed to delete project.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Dashboard</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Welcome, {userName}. Manage your projects in one place.
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{projectCountLabel}</p>
        </div>
        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Add project
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {projects.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-zinc-200 bg-white p-10 text-center dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            No projects yet. Click &quot;Add project&quot; to create your first one.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <div
              key={project.id}
              className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
            >
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">{project.name}</h3>
              {project.description ? (
                <p className="mt-1 line-clamp-3 text-sm text-zinc-600 dark:text-zinc-300">
                  {project.description}
                </p>
              ) : (
                <p className="mt-1 text-sm text-zinc-400 dark:text-zinc-500">No description</p>
              )}
              <div className="mt-3 space-y-1 text-xs text-zinc-500 dark:text-zinc-400">
                <p>Categories: {project.categoriesCount}</p>
                <p>Created: {formatDate(project.createdAt)}</p>
                <p>Updated: {formatDate(project.updatedAt)}</p>
              </div>
              <div className="mt-4 flex gap-2">
                <Link
                  href={`/dashboard/projects/${project.id}`}
                  className="rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                  Open
                </Link>
                <button
                  type="button"
                  onClick={() => openEditModal(project)}
                  className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => openDeleteModal(project)}
                  className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isCreateOpen && (
        <Modal
          title="Create project"
          onClose={() => {
            if (loading) return;
            setIsCreateOpen(false);
            resetCreateState();
          }}
        >
          <form onSubmit={handleCreateProject} className="space-y-3">
            <div>
              <label htmlFor="create-name" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Name
              </label>
              <input
                id="create-name"
                type="text"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                required
                disabled={loading}
              />
            </div>
            <div>
              <label
                htmlFor="create-description"
                className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Description (optional)
              </label>
              <textarea
                id="create-description"
                value={createDescription}
                onChange={(e) => setCreateDescription(e.target.value)}
                rows={4}
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                disabled={loading}
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsCreateOpen(false);
                  resetCreateState();
                }}
                className="rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                disabled={loading}
              >
                {loading ? "Creating..." : "Create"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {isEditOpen && selectedProject && (
        <Modal
          title={`Edit ${selectedProject.name}`}
          onClose={() => {
            if (loading) return;
            setIsEditOpen(false);
            setSelectedProject(null);
          }}
        >
          <form onSubmit={handleEditProject} className="space-y-3">
            <div>
              <label htmlFor="edit-name" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Name
              </label>
              <input
                id="edit-name"
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                required
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="edit-description" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Description (optional)
              </label>
              <textarea
                id="edit-description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={4}
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                disabled={loading}
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsEditOpen(false);
                  setSelectedProject(null);
                }}
                className="rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save changes"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {isDeleteOpen && selectedProject && (
        <Modal
          title="Delete project"
          onClose={() => {
            if (loading) return;
            setIsDeleteOpen(false);
            setSelectedProject(null);
          }}
        >
          <div className="space-y-4">
            <p className="text-sm text-zinc-700 dark:text-zinc-300">
              Are you sure you want to delete <strong>{selectedProject.name}</strong>? This action cannot be
              undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteOpen(false);
                  setSelectedProject(null);
                }}
                className="rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteProject}
                className="rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
                disabled={loading}
              >
                {loading ? "Deleting..." : "Delete project"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
