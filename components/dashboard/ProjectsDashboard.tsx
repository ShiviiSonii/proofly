"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, FolderTree, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { LogoutButton } from "@/components/dashboard/LogoutButton";
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
  categoriesCount: number;
  acceptedTestimonialsCount: number;
};

type ProjectsDashboardProps = {
  initialProjects: Project[];
  userName: string;
  userEmail: string;
};

type ApiProject = {
  id: string;
  name: string;
  description: string | null;
  categories?: Array<{
    _count?: {
      testimonials?: number;
    };
  }>;
  _count?: {
    categories?: number;
  };
};

function toProject(apiProject: ApiProject): Project {
  return {
    id: apiProject.id,
    name: apiProject.name,
    description: apiProject.description,
    categoriesCount: apiProject._count?.categories ?? 0,
    acceptedTestimonialsCount:
      apiProject.categories?.reduce(
        (total, category) => total + (category._count?.testimonials ?? 0),
        0
      ) ?? 0,
  };
}

export function ProjectsDashboard({ initialProjects, userName, userEmail }: ProjectsDashboardProps) {
  const router = useRouter();
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
  const displayName = userName.trim() || "User";
  const displayEmail = userEmail.trim() || "No email";
  const nameInitial = displayName.charAt(0).toUpperCase() || "U";

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

  function openProjectWorkspace(projectId: string) {
    router.push(`/dashboard/projects/${projectId}`);
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
    <div className="space-y-4">
      <div className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <img src="/logo.png" alt="Proofly" className="h-10 rounded-md" />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="flex size-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                {nameInitial}
              </div>
              <div className="min-w-0">
                <p className="max-w-44 truncate text-sm font-medium">{displayName}</p>
                <p className="max-w-44 truncate text-xs text-muted-foreground">{displayEmail}</p>
              </div>
              <LogoutButton
                iconOnly
                label="Log out"
                className="size-8 border-border bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground"
              />
            </div>
          </div>
        </div>
      </div>

      <main className="p-5">
        <div className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Projects</h1>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Welcome to Proofly, {displayName}. Manage your projects in one place.
              </p>
             </div>
            <div className="flex items-center gap-2">
              <Button type="button" onClick={() => setIsCreateOpen(true)}>
                Add project
              </Button>
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
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {projects.map((project) => (
                <Card
                  key={project.id}
                  className="group cursor-pointer border-zinc-200/80 transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-zinc-800"
                  role="button"
                  tabIndex={0}
                  onClick={() => openProjectWorkspace(project.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      openProjectWorkspace(project.id);
                    }
                  }}
                >
                  <CardHeader className="space-y-3 pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <CardTitle className="line-clamp-1 text-base">{project.name}</CardTitle>
                      <div className="flex items-center gap-1.5">
                        <Button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(project);
                          }}
                          variant="outline"
                          size="sm"
                          className="h-8 gap-1.5 border-zinc-200 bg-transparent px-2 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                          aria-label={`Edit ${project.name}`}
                          title="Edit project"
                        >
                          <Pencil className="size-4" />
                          <span className="text-xs">Edit</span>
                        </Button>
                        <Button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openDeleteModal(project);
                          }}
                          variant="destructive"
                          size="sm"
                          className="h-8 gap-1.5 px-2"
                          aria-label={`Delete ${project.name}`}
                          title="Delete project"
                        >
                          <Trash2 className="size-4" />
                          <span className="text-xs">Delete</span>
                        </Button>
                      </div>
                    </div>
                    <CardDescription className="line-clamp-2 min-h-6">
                      {project.description || "No description added yet."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-md border bg-zinc-50/80 p-3 dark:bg-zinc-900/50">
                        <div className="mb-1 flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                          <FolderTree className="size-3.5" />
                          Categories
                        </div>
                        <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                          {project.categoriesCount}
                        </p>
                      </div>
                      <div className="rounded-md border bg-zinc-50/80 p-3 dark:bg-zinc-900/50">
                        <div className="mb-1 flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                          <CheckCircle2 className="size-3.5" />
                          Accepted
                        </div>
                        <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                          {project.acceptedTestimonialsCount}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

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
