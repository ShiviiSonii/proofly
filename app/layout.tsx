import type { Metadata } from "next";
import { Geist, Inter } from "next/font/google";
import { SessionProvider } from "@/components/SessionProvider";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Proofly",
  description: "Automated testimonial collection and management",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn("font-sans", inter.variable)}>
      <body className={`${geist.className} antialiased`}>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
