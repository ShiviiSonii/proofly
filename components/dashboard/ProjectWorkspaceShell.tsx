"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { PanelLeft, PanelLeftClose } from "lucide-react";
import { ProjectSidebar } from "@/components/dashboard/ProjectSidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
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

type ProjectOption = {
  id: string;
  name: string;
};

type ProjectWorkspaceShellProps = {
  projectId: string;
  projects: ProjectOption[];
  userName: string;
  userEmail: string;
  children: React.ReactNode;
};

export function ProjectWorkspaceShell({
  projectId,
  projects,
  userName,
  userEmail,
  children,
}: ProjectWorkspaceShellProps) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");

  async function handleCreateProject(e: React.FormEvent) {
    e.preventDefault();
    if (!newProjectName.trim()) {
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
          name: newProjectName.trim(),
          description: newProjectDescription.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create project.");
        return;
      }

      setIsAddProjectOpen(false);
      setNewProjectName("");
      setNewProjectDescription("");
      router.push(`/dashboard/projects/${data.id}`);
      router.refresh();
    } catch {
      setError("Failed to create project.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background p-4 lg:p-6">
      <div className="flex min-h-[calc(100vh-2rem)] flex-col gap-4 lg:min-h-[calc(100vh-3rem)] lg:flex-row lg:items-stretch">
        {sidebarOpen ? (
          <ProjectSidebar
            projectId={projectId}
            projects={projects}
            onAddProject={() => setIsAddProjectOpen(true)}
            userName={userName}
            userEmail={userEmail}
          />
        ) : null}

        <section className="min-w-0 flex-1">
          <div className="mb-4 rounded-xl border bg-background p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setSidebarOpen((prev) => !prev)}
                  title="Toggle sidebar"
                >
                  {sidebarOpen ? <PanelLeftClose /> : <PanelLeft />}
                </Button>
                <Button asChild variant="outline">
                  <Link href="/dashboard">Back to dashboard</Link>
                </Button>
              </div>
              <ThemeToggle />
            </div>
          </div>

          {error ? (
            <div className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          ) : null}

          <main className="min-h-screen min-w-0 rounded-xl border bg-background p-5">
            {children}
          </main>
        </section>
      </div>

      <Dialog open={isAddProjectOpen} onOpenChange={setIsAddProjectOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create project</DialogTitle>
            <DialogDescription>Add a new project and switch to it.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateProject} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="workspace-create-project-name">Name</Label>
              <Input
                id="workspace-create-project-name"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="workspace-create-project-description">Description (optional)</Label>
              <Textarea
                id="workspace-create-project-description"
                value={newProjectDescription}
                onChange={(e) => setNewProjectDescription(e.target.value)}
                rows={4}
                disabled={loading}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" disabled={loading} onClick={() => setIsAddProjectOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create project"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
