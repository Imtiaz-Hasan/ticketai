"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DashboardShell } from "@/components/dashboard-shell";
import { StatCard } from "@/components/stat-card";
import { StatusBadge } from "@/components/status-badge";
import { PriorityBadge } from "@/components/priority-badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { Ticket, Plus, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { Status, Priority } from "@prisma/client";

interface RecentTicket {
  id: string;
  title: string;
  status: Status;
  priority: Priority;
  category: string;
  createdAt: string;
}

interface DashboardStats {
  totalTickets: number;
  openTickets: number;
  resolvedTickets: number;
  closedTickets: number;
  recentTickets: RecentTicket[];
}

export default function CustomerDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchStats() {
      try {
        const res = await fetch("/api/dashboard/stats");
        if (!res.ok) {
          throw new Error("Failed to fetch dashboard stats");
        }
        const data: DashboardStats = await res.json();
        if (!cancelled) {
          setStats(data);
        }
      } catch {
        if (!cancelled) {
          toast.error("Failed to load dashboard data");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchStats();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <DashboardShell requiredRole="CUSTOMER">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Overview of your support tickets
            </p>
          </div>
          <Link href="/customer/tickets/new" className={buttonVariants()}>
            <Plus className="mr-2 h-4 w-4" />
            Create New Ticket
          </Link>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))
          ) : (
            <>
              <StatCard
                title="Total Tickets"
                value={stats?.totalTickets ?? 0}
                description="All time tickets"
                icon={<Ticket className="h-5 w-5 text-muted-foreground" />}
              />
              <StatCard
                title="Open"
                value={stats?.openTickets ?? 0}
                description="Awaiting response"
                icon={<AlertCircle className="h-5 w-5 text-blue-500" />}
              />
              <StatCard
                title="Resolved"
                value={stats?.resolvedTickets ?? 0}
                description="Successfully resolved"
                icon={<CheckCircle className="h-5 w-5 text-green-500" />}
              />
              <StatCard
                title="Closed"
                value={stats?.closedTickets ?? 0}
                description="Closed tickets"
                icon={<Clock className="h-5 w-5 text-gray-500" />}
              />
            </>
          )}
        </div>

        {/* Recent Tickets */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Tickets</CardTitle>
            <Link href="/customer/tickets" className={buttonVariants({ variant: "outline", size: "sm" })}>View All</Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : !stats?.recentTickets?.length ? (
              <div className="text-center py-8 text-muted-foreground">
                <Ticket className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p>No tickets yet. Create your first ticket to get started.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.recentTickets.map((ticket) => (
                  <Link
                    key={ticket.id}
                    href={`/customer/tickets/${ticket.id}`}
                    className="block"
                  >
                    <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{ticket.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(ticket.createdAt), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <PriorityBadge priority={ticket.priority} />
                        <StatusBadge status={ticket.status} />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
