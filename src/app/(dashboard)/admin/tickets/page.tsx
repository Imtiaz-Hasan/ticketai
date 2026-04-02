"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { DashboardShell } from "@/components/dashboard-shell";
import { StatusBadge } from "@/components/status-badge";
import { PriorityBadge } from "@/components/priority-badge";
import { CategoryBadge } from "@/components/category-badge";
import { EmptyState } from "@/components/empty-state";
import { Pagination } from "@/components/pagination";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Search } from "lucide-react";
import { Status, Priority } from "@prisma/client";

interface TicketListItem {
  id: string;
  title: string;
  status: Status;
  priority: Priority;
  category: string;
  createdAt: string;
  customer: { id: string; name: string; email: string };
  assignedAgent: { id: string; name: string; email: string } | null;
}

interface TicketsResponse {
  data: TicketListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const CATEGORIES = [
  "Billing",
  "Technical Support",
  "Bug Report",
  "Feature Request",
  "General Inquiry",
  "Account Issue",
];

export default function AdminTicketsPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<TicketListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("pageSize", "10");
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      if (priorityFilter) params.set("priority", priorityFilter);
      if (categoryFilter) params.set("category", categoryFilter);

      const res = await fetch(`/api/tickets?${params.toString()}`);
      if (!res.ok) {
        throw new Error("Failed to fetch tickets");
      }
      const data: TicketsResponse = await res.json();
      setTickets(data.data);
      setTotalPages(data.totalPages);
    } catch {
      toast.error("Failed to load tickets");
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, priorityFilter, categoryFilter]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, priorityFilter, categoryFilter]);

  return (
    <DashboardShell requiredRole="ADMIN">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ticket Management</h1>
          <p className="text-muted-foreground">
            View and manage all support tickets
          </p>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tickets..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Select value={statusFilter} onValueChange={(value) => { if (value !== null) setStatusFilter(value); }}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="OPEN">Open</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="RESOLVED">Resolved</SelectItem>
                  <SelectItem value="CLOSED">Closed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={(value) => { if (value !== null) setPriorityFilter(value); }}>
                <SelectTrigger>
                  <SelectValue placeholder="All Priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Priorities</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="URGENT">Urgent</SelectItem>
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={(value) => { if (value !== null) setCategoryFilter(value); }}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Categories</SelectItem>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tickets Table */}
        <Card>
          <CardHeader>
            <CardTitle>Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : tickets.length === 0 ? (
              <EmptyState
                title="No tickets found"
                description="No tickets match your current filters. Try adjusting your search criteria."
              />
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Agent</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tickets.map((ticket) => (
                      <TableRow
                        key={ticket.id}
                        className="cursor-pointer hover:bg-accent"
                        onClick={() => router.push(`/admin/tickets/${ticket.id}`)}
                      >
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {ticket.id.slice(0, 8)}...
                        </TableCell>
                        <TableCell className="font-medium max-w-[200px] truncate">
                          {ticket.title}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {ticket.customer.name}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {ticket.assignedAgent?.name ?? "Unassigned"}
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

                <Pagination
                  page={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
