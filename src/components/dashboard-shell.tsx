"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { Role } from "@prisma/client";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardShellProps {
  children: React.ReactNode;
  requiredRole?: Role;
}

export function DashboardShell({ children, requiredRole }: DashboardShellProps) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex h-screen">
        <div className="hidden lg:block w-64 border-r">
          <div className="p-6 space-y-4">
            <Skeleton className="h-8 w-32" />
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </div>
        </div>
        <div className="flex-1 p-8">
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    redirect("/login");
  }

  if (requiredRole && session.user.role !== requiredRole) {
    redirect(`/${session.user.role.toLowerCase()}`);
  }

  return (
    <div className="min-h-screen">
      <Sidebar
        userName={session.user.name}
        userEmail={session.user.email}
        userRole={session.user.role}
      />
      <main className="lg:pl-64">
        <div className="p-4 pt-16 lg:pt-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
