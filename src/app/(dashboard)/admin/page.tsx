"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DashboardShell } from "@/components/dashboard-shell";
import { StatCard } from "@/components/stat-card";
import { StatusBadge } from "@/components/status-badge";
import { PriorityBadge } from "@/components/priority-badge";
import { CategoryBadge } from "@/components/category-badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Ticket,
  CheckCircle,
  AlertCircle,
  Loader,
  XCircle,
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
  assignedAgent: { id: string; name: string; email: string } | null;
}

interface CategoryData {
  category: string;
  count: number;
}

interface PriorityData {
  priority: string;
  count: number;
}

interface TimeData {
  date: string;
  count: number;
}

interface DashboardStats {
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  closedTickets: number;
  ticketsByCategory: CategoryData[];
  ticketsByPriority: PriorityData[];
  ticketsOverTime: TimeData[];
  recentTickets: RecentTicket[];
}

const CATEGORY_COLORS: Record<string, string> = {
  Billing: "#8b5cf6",
  "Technical Support": "#06b6d4",
  "Bug Report": "#ef4444",
  "Feature Request": "#10b981",
  "General Inquiry": "#64748b",
  "Account Issue": "#f59e0b",
  Uncategorized: "#9ca3af",
};

const PRIORITY_COLORS: Record<string, string> = {
  LOW: "#10b981",
  MEDIUM: "#3b82f6",
  HIGH: "#f97316",
  URGENT: "#ef4444",
};

export default function AdminDashboardPage() {
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
    <DashboardShell requiredRole="ADMIN">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of all support tickets across the platform
          </p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
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
                title="In Progress"
                value={stats?.inProgressTickets ?? 0}
                description="Currently being handled"
                icon={<Loader className="h-5 w-5 text-yellow-500" />}
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
                icon={<XCircle className="h-5 w-5 text-gray-500" />}
              />
            </>
          )}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-[380px]" />
            ))
          ) : (
            <>
              {/* Pie/Donut Chart: Tickets by Category */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Tickets by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  {stats?.ticketsByCategory.length ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={stats.ticketsByCategory}
                          dataKey="count"
                          nameKey="category"
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={2}
                        >
                          {stats.ticketsByCategory.map((entry) => (
                            <Cell
                              key={entry.category}
                              fill={CATEGORY_COLORS[entry.category] || CATEGORY_COLORS.Uncategorized}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-[300px] text-muted-foreground text-sm">
                      No data available
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Line Chart: Tickets Over Time */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Tickets Over Time (30 days)</CardTitle>
                </CardHeader>
                <CardContent>
                  {stats?.ticketsOverTime.length ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={stats.ticketsOverTime}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) => {
                            const d = new Date(value as string);
                            return `${d.getMonth() + 1}/${d.getDate()}`;
                          }}
                          interval="preserveStartEnd"
                        />
                        <YAxis allowDecimals={false} />
                        <Tooltip
                          labelFormatter={(label) => {
                            return new Date(label as string).toLocaleDateString();
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="count"
                          stroke="#8b5cf6"
                          strokeWidth={2}
                          dot={false}
                          name="Tickets"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-[300px] text-muted-foreground text-sm">
                      No data available
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Bar Chart: Tickets by Priority */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Tickets by Priority</CardTitle>
                </CardHeader>
                <CardContent>
                  {stats?.ticketsByPriority.length ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={stats.ticketsByPriority}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="priority" tick={{ fontSize: 12 }} />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="count" name="Tickets">
                          {stats.ticketsByPriority.map((entry) => (
                            <Cell
                              key={entry.priority}
                              fill={PRIORITY_COLORS[entry.priority] || "#6b7280"}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-[300px] text-muted-foreground text-sm">
                      No data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Recent Tickets Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Tickets</CardTitle>
            <Link href="/admin/tickets" className={buttonVariants({ variant: "outline", size: "sm" })}>View All</Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : !stats?.recentTickets?.length ? (
              <div className="text-center py-8 text-muted-foreground">
                <Ticket className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p>No tickets yet.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.recentTickets.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell>
                        <Link
                          href={`/admin/tickets/${ticket.id}`}
                          className="font-medium hover:underline"
                        >
                          {ticket.title}
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {ticket.customer.name}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={ticket.status} />
                      </TableCell>
                      <TableCell>
                        <PriorityBadge priority={ticket.priority} />
                      </TableCell>
                      <TableCell>
                        <CategoryBadge category={ticket.category} />
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {formatDistanceToNow(new Date(ticket.createdAt), {
                          addSuffix: true,
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
