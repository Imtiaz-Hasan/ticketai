"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DashboardShell } from "@/components/dashboard-shell";
import { StatCard } from "@/components/stat-card";
import { StatusBadge } from "@/components/status-badge";
import { PriorityBadge } from "@/components/priority-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import {
  Ticket,
  ClipboardList,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Status, Priority } from "@prisma/client";

interface RecentTicket {
  id: string;
  title: string;
  status: Status;
  priority: Priority;
  category: string;
  createdAt: string;
  customer: { id: string; name: string; email: string };
}

interface AgentDashboardStats {
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  recentTickets: RecentTicket[];
}

export default function AgentDashboardPage() {
  const [stats, setStats] = useState<AgentDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchStats() {
      try {
        const res = await fetch("/api/dashboard/stats");
        if (!res.ok) {
          throw new Error("Failed to fetch dashboard stats");
        }
        const data: AgentDashboardStats = await res.json();
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
    <DashboardShell requiredRole="AGENT">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agent Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your assigned tickets
          </p>
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
                title="Assigned Tickets"
                value={stats?.totalTickets ?? 0}
                description="Total assigned to you"
                icon={<ClipboardList className="h-5 w-5 text-muted-foreground" />}
              />
              <StatCard
                title="Open"
                value={stats?.openTickets ?? 0}
                description="Awaiting your action"
                icon={<AlertCircle className="h-5 w-5 text-blue-500" />}
              />
              <StatCard
                title="In Progress"
                value={stats?.inProgressTickets ?? 0}
                description="Currently working on"
                icon={<Clock className="h-5 w-5 text-yellow-500" />}
              />
              <StatCard
                title="Resolved"
                value={stats?.resolvedTickets ?? 0}
                description="Successfully resolved"
                icon={<CheckCircle className="h-5 w-5 text-green-500" />}
              />
            </>
          )}
        </div>

        {/* Recent Assigned Tickets */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Assigned Tickets</CardTitle>
            <Link href="/agent/tickets" className={buttonVariants({ variant: "outline", size: "sm" })}>View All</Link>
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
                <p>No tickets assigned to you yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.recentTickets.map((ticket) => (
                  <Link
                    key={ticket.id}
                    href={`/agent/tickets/${ticket.id}`}
                    className="block"
                  >
                    <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{ticket.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {ticket.customer?.name ?? "Unknown customer"} &middot;{" "}
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
