"use client";

import Link from "next/link";
import type { ComponentType } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  History,
  Settings,
  Sparkles,
  Star,
} from "lucide-react";
import { LogoutButton } from "@/components/dashboard/LogoutButton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type ProjectOption = {
  id: string;
  name: string;
};

type ProjectSidebarProps = {
  projectId: string;
  projects: ProjectOption[];
  onAddProject: () => void;
  userName: string;
  userEmail: string;
};

const projectItems = [
  { label: "Overview", href: "", icon: Sparkles },
  { label: "Categories", href: "/categories", icon: Star },
  { label: "Testimonials", href: "/testimonials", icon: History },
  { label: "API Keys", href: "/api-keys", icon: Settings },
];

export function ProjectSidebar({
  projectId,
  projects,
  onAddProject,
  userName,
  userEmail,
}: ProjectSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const basePath = `/dashboard/projects/${projectId}`;
  const nameInitial = userName.trim().charAt(0).toUpperCase() || "U";

  function NavRow({
    label,
    icon: Icon,
    rightIcon,
    isActive = false,
    href,
  }: {
    label: string;
    icon: ComponentType<{ className?: string }>;
    rightIcon?: ComponentType<{ className?: string }>;
    isActive?: boolean;
    href?: string;
  }) {
    const RightIcon = rightIcon;
    const content = (
      <span
        className={cn(
          "flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-sm font-medium transition",
          isActive
            ? "bg-primary text-primary-foreground"
            : "text-foreground/85 hover:bg-accent hover:text-accent-foreground"
        )}
      >
        <span className="flex items-center gap-2.5">
          <Icon className="size-4" />
          <span>{label}</span>
        </span>
        {RightIcon ? <RightIcon className="size-4 text-muted-foreground" /> : null}
      </span>
    );

    if (!href) {
      return <div>{content}</div>;
    }

    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }

  return (
    <aside className="flex h-full bg-background min-h-[calc(100vh-2rem)] w-full flex-col text-foreground lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)] lg:min-h-[calc(100vh-3rem)] lg:w-72 lg:shrink-0 lg:self-start lg:overflow-y-auto">
      <div className="">
        <div className="min-w-0">
          <p className="truncate text-lg font-heading tracking-wider">Proofly</p>
        </div>
        <Select
          value={projectId}
          onValueChange={(value) => {
            if (value === "__add_project__") {
              onAddProject();
              return;
            }
            router.push(`/dashboard/projects/${value}`);
          }}
        >
          <SelectTrigger className="mt-3 w-full border-border bg-background text-foreground">
            <SelectValue placeholder="Switch project" />
          </SelectTrigger>
          <SelectContent>
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.name}
              </SelectItem>
            ))}
            <SelectItem value="__add_project__">+ Add new project</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="mt-6 px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Project
      </div>

      <nav className="mt-2 space-y-1">
        {projectItems.map((item) => {
          const fullPath = `${basePath}${item.href}`;
          return (
            <NavRow
              key={item.label}
              label={item.label}
              icon={item.icon}
              href={fullPath}
              isActive={pathname === fullPath}
            />
          );
        })}
      </nav>

      <div className="mt-auto pt-4">
        <div className="rounded-xl border border-border bg-card p-3">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
              {nameInitial}
            </div>
            <div className="flex min-w-0 flex-1 items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{userName}</p>
                <p className="truncate text-xs text-muted-foreground">{userEmail}</p>
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
    </aside>
  );
}
