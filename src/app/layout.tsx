import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Providers } from "@/components/providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "TicketAI - AI-Powered Customer Support",
  description:
    "Intelligent customer ticket management with AI-powered classification, role-based access, and real-time tracking.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background antialiased", inter.variable, "font-sans")}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
