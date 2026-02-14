import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
    const session = await auth();
    if (!session?.user) redirect("/sign-in");

    const user = session.user;

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black">
            {/* Navbar */}
            <nav className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
                <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
                    <span className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Proofly</span>

                    <div className="flex items-center gap-4">
                        <span className="text-sm text-zinc-600 dark:text-zinc-400">{user.email}</span>
                        <form
                            action={async () => {
                                "use server";
                                await signOut({ redirectTo: "/sign-in" });
                            }}
                        >
                            <button
                                type="submit"
                                className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
                            >
                                Sign out
                            </button>
                        </form>
                    </div>
                </div>
            </nav>

            {/* Content */}
            <main className="mx-auto max-w-5xl px-6 py-10">
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Dashboard</h1>
                <p className="mt-1 text-sm text-zinc-500">
                    Welcome back, {user.name}!
                </p>

                {/* Stats */}
                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                    {[
                        { label: "Total Testimonials", value: "0" },
                        { label: "Pending", value: "0" },
                        { label: "Published", value: "0" },
                    ].map((stat) => (
                        <div
                            key={stat.label}
                            className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950"
                        >
                            <p className="text-sm text-zinc-500">{stat.label}</p>
                            <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-50">{stat.value}</p>
                        </div>
                    ))}
                </div>

                {/* Empty state */}
                <div className="mt-10 flex flex-col items-center rounded-xl border-2 border-dashed border-zinc-200 py-16 dark:border-zinc-800">
                    <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">No testimonials yet</p>
                    <p className="mt-1 text-sm text-zinc-500">
                        Start collecting testimonials from your customers.
                    </p>
                </div>
            </main>
        </div>
    );
}
