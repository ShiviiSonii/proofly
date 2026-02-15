import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Testimonials",
  robots: "noindex, nofollow", // Noindex so Google doesn't index this page (it's an iframe).
};

export default function EmbedTestimonialsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
