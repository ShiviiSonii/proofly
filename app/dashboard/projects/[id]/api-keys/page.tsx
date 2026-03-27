import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ApiKeysManager } from "@/components/dashboard/ApiKeysManager";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ProjectApiKeysPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id },
    select: {
      ownerId: true,
      apiKeys: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          createdAt: true,
          lastUsedAt: true,
          revoked: true,
        },
      },
    },
  });

  if (!project || project.ownerId !== session.user.id) {
    notFound();
  }

  const initialKeys = project.apiKeys.map((key) => ({
    id: key.id,
    name: key.name,
    createdAt: key.createdAt.toISOString(),
    lastUsedAt: key.lastUsedAt ? key.lastUsedAt.toISOString() : null,
    revoked: key.revoked,
  }));

  const endpoint = `/api/public/projects/${id}/testimonials`;

  return (
    <div className="space-y-6">
      <ApiKeysManager projectId={id} initialKeys={initialKeys} />

      <section className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">How to use this API</h3>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Use an active API key to read testimonials for this project.
        </p>

        <div className="mt-4 space-y-4 text-sm text-zinc-700 dark:text-zinc-300">
          <div>
            <p className="font-medium">Endpoint</p>
            <code className="mt-1 block rounded-md border border-zinc-200 bg-zinc-50 p-2 text-xs dark:border-zinc-800 dark:bg-zinc-900">
              GET {endpoint}
            </code>
          </div>

          <div>
            <p className="font-medium">Auth header</p>
            <code className="mt-1 block rounded-md border border-zinc-200 bg-zinc-50 p-2 text-xs dark:border-zinc-800 dark:bg-zinc-900">
              x-proofly-api-key: pk_your_api_key_here
            </code>
          </div>

          <div>
            <p className="font-medium">Query params</p>
            <ul className="mt-1 list-disc pl-5 text-xs text-zinc-600 dark:text-zinc-400">
              <li>
                <code>status</code>: <code>approved</code> | <code>pending</code> | <code>rejected</code> (default:
                approved)
              </li>
              <li>
                <code>categoryId</code>: filter by category
              </li>
              <li>
                <code>limit</code>: 1-50 (default: 20)
              </li>
              <li>
                <code>cursor</code>: for pagination
              </li>
            </ul>
          </div>

          <div>
            <p className="font-medium">cURL example</p>
            <pre className="mt-1 overflow-x-auto rounded-md border border-zinc-200 bg-zinc-50 p-3 text-xs dark:border-zinc-800 dark:bg-zinc-900">
{`curl -X GET "https://your-domain.com${endpoint}?status=approved&limit=20" \\
  -H "x-proofly-api-key: pk_your_api_key_here"`}
            </pre>
          </div>

          <div>
            <p className="font-medium">JavaScript fetch example</p>
            <pre className="mt-1 overflow-x-auto rounded-md border border-zinc-200 bg-zinc-50 p-3 text-xs dark:border-zinc-800 dark:bg-zinc-900">
{`const res = await fetch("https://your-domain.com${endpoint}?status=approved&limit=20", {
  headers: {
    "x-proofly-api-key": "pk_your_api_key_here",
  },
});

const data = await res.json();
console.log(data.items, data.nextCursor);`}
            </pre>
          </div>
        </div>
      </section>
    </div>
  );
}
