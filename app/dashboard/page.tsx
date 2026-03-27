import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ProjectsDashboard } from "@/components/dashboard/ProjectsDashboard";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const projects = await prisma.project.findMany({
    where: { ownerId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { categories: true } },
      categories: {
        select: {
          _count: {
            select: {
              testimonials: {
                where: { status: "approved" },
              },
            },
          },
        },
      },
    },
  });

  const initialProjects = projects.map((project) => ({
    id: project.id,
    name: project.name,
    description: project.description,
    categoriesCount: project._count.categories,
    acceptedTestimonialsCount: project.categories.reduce(
      (total, category) => total + category._count.testimonials,
      0
    ),
  }));

  return (
    <div className="min-h-screen bg-background p-4 lg:p-6">
      <div className="w-full">
        <ProjectsDashboard
          initialProjects={initialProjects}
          userName={session.user.name ?? "there"}
          userEmail={session.user.email ?? "No email"}
        />
      </div>
    </div>
  );
}
