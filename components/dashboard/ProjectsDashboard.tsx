"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
        <div className="flex items-center gap-2">
          <Button type="button" onClick={() => setIsCreateOpen(true)}>
            Add project
          </Button>
          <ThemeToggle />
        </div>
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
            <Card key={project.id}>
              <CardHeader>
                <CardTitle>{project.name}</CardTitle>
                <CardDescription>
                  {project.description || "No description"}
                </CardDescription>
              </CardHeader>
              <CardContent>
              <div className="mt-3 space-y-1 text-xs text-zinc-500 dark:text-zinc-400">
                <p>Categories: {project.categoriesCount}</p>
                <p>Created: {formatDate(project.createdAt)}</p>
                <p>Updated: {formatDate(project.updatedAt)}</p>
              </div>
              <div className="mt-4 flex gap-2">
                <Button asChild size="sm">
                  <Link href={`/dashboard/projects/${project.id}`}>Open</Link>
                </Button>
                <Button
                  type="button"
                  onClick={() => openEditModal(project)}
                  variant="outline"
                  size="sm"
                >
                  Edit
                </Button>
                <Button
                  type="button"
                  onClick={() => openDeleteModal(project)}
                  variant="destructive"
                  size="sm"
                >
                  Delete
                </Button>
              </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {isCreateOpen && (
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Create project</DialogTitle>
              <DialogDescription>Add a new project to your dashboard.</DialogDescription>
            </DialogHeader>
          <form onSubmit={handleCreateProject} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="create-name">Name</Label>
              <Input
                id="create-name"
                type="text"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-description">Description (optional)</Label>
              <Textarea
                id="create-description"
                value={createDescription}
                onChange={(e) => setCreateDescription(e.target.value)}
                rows={4}
                disabled={loading}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                onClick={() => {
                  setIsCreateOpen(false);
                  resetCreateState();
                }}
                variant="outline"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
              >
                {loading ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </form>
          </DialogContent>
        </Dialog>
      )}

      {isEditOpen && selectedProject && (
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{`Edit ${selectedProject.name}`}</DialogTitle>
              <DialogDescription>Update project details.</DialogDescription>
            </DialogHeader>
          <form onSubmit={handleEditProject} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description (optional)</Label>
              <Textarea
                id="edit-description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={4}
                disabled={loading}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                onClick={() => {
                  setIsEditOpen(false);
                  setSelectedProject(null);
                }}
                variant="outline"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
          </DialogContent>
        </Dialog>
      )}

      {isDeleteOpen && selectedProject && (
        <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Delete project</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete <strong>{selectedProject.name}</strong>? This action cannot be
                undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                type="button"
                onClick={() => {
                  setIsDeleteOpen(false);
                  setSelectedProject(null);
                }}
                variant="outline"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleDeleteProject}
                variant="destructive"
                disabled={loading}
              >
                {loading ? "Deleting..." : "Delete project"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
