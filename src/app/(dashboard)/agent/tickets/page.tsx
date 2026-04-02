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
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { Search, ClipboardList } from "lucide-react";
import { Status, Priority } from "@prisma/client";

interface TicketRow {
  id: string;
  title: string;
  status: Status;
  priority: Priority;
  category: string;
  createdAt: string;
  customer: { id: string; name: string; email: string };
}

interface TicketsResponse {
  data: TicketRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export default function AgentTicketsPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: "10",
      });
      if (search) {
        params.set("search", search);
      }
      if (statusFilter && statusFilter !== "ALL") {
        params.set("status", statusFilter);
      }

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
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    fetchTickets();
  }

  function handleStatusChange(value: string) {
    setStatusFilter(value);
    setPage(1);
  }

  return (
    <DashboardShell requiredRole="AGENT">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            My Assigned Tickets
          </h1>
          <p className="text-muted-foreground">
            Manage tickets assigned to you
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleSearchSubmit} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tickets..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </form>
          <Select value={statusFilter} onValueChange={(value) => { if (value !== null) handleStatusChange(value); }}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="OPEN">Open</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="RESOLVED">Resolved</SelectItem>
              <SelectItem value="CLOSED">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : tickets.length === 0 ? (
          <EmptyState
            title="No tickets found"
            description="No tickets are assigned to you yet, or no tickets match your filters."
            action={
              <ClipboardList className="h-10 w-10 text-muted-foreground" />
            }
          />
        ) : (
          <>
            <div className="rounded-md border">
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
                  {tickets.map((ticket) => (
                    <TableRow
                      key={ticket.id}
                      className="cursor-pointer"
                      onClick={() =>
                        router.push(`/agent/tickets/${ticket.id}`)
                      }
                    >
                      <TableCell className="font-medium max-w-[250px] truncate">
                        {ticket.title}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {ticket.customer?.name ?? "Unknown"}
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
                      <TableCell className="text-muted-foreground">
                        {formatDistanceToNow(new Date(ticket.createdAt), {
                          addSuffix: true,
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </>
        )}
      </div>
    </DashboardShell>
  );
}
