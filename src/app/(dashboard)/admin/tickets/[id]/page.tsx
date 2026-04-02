"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { DashboardShell } from "@/components/dashboard-shell";
import { StatusBadge } from "@/components/status-badge";
import { PriorityBadge } from "@/components/priority-badge";
import { CategoryBadge } from "@/components/category-badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import {
  ArrowLeft,
  Loader2,
  MessageSquare,
  Send,
  Sparkles,
  Clock,
  Settings,
  User,
} from "lucide-react";
import { Status, Priority, Role } from "@prisma/client";

interface CommentUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

interface Comment {
  id: string;
  content: string;
  isInternal: boolean;
  createdAt: string;
  user: CommentUser;
}

interface Activity {
  id: string;
  action: string;
  details: string | null;
  createdAt: string;
  user: { id: string; name: string; email: string };
}

interface TicketDetail {
  id: string;
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  category: string;
  aiCategory: string | null;
  aiPriority: string | null;
  aiSummary: string | null;
  humanCategory: string | null;
  humanPriority: string | null;
  createdAt: string;
  updatedAt: string;
  customer: { id: string; name: string; email: string };
  assignedAgent: { id: string; name: string; email: string } | null;
  comments: Comment[];
  activities: Activity[];
}

interface AgentOption {
  id: string;
  name: string;
  email: string;
}

interface AgentsResponse {
  data: AgentOption[];
}

const CATEGORIES = [
  "Billing",
  "Technical Support",
  "Bug Report",
  "Feature Request",
  "General Inquiry",
  "Account Issue",
];

const roleBadgeVariant: Record<Role, string> = {
  ADMIN: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  AGENT: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  CUSTOMER: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
};

export default function AdminTicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = params.id as string;

  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [agents, setAgents] = useState<AgentOption[]>([]);
  const [commentText, setCommentText] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        const [ticketRes, agentsRes] = await Promise.all([
          fetch(`/api/tickets/${ticketId}`),
          fetch("/api/users?role=AGENT&pageSize=100"),
        ]);

        if (!ticketRes.ok) {
          if (ticketRes.status === 404) {
            toast.error("Ticket not found");
            router.push("/admin/tickets");
            return;
          }
          throw new Error("Failed to fetch ticket");
        }

        const ticketData: TicketDetail = await ticketRes.json();
        if (!cancelled) {
          setTicket(ticketData);
        }

        if (agentsRes.ok) {
          const agentsData: AgentsResponse = await agentsRes.json();
          if (!cancelled) {
            setAgents(agentsData.data);
          }
        }
      } catch {
        if (!cancelled) {
          toast.error("Failed to load ticket");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [ticketId, router]);

  async function handleUpdateTicket(updates: Record<string, unknown>) {
    setUpdating(true);
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update ticket");
      }

      const updated: TicketDetail = await res.json();
      setTicket(updated);
      toast.success("Ticket updated");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update ticket";
      toast.error(message);
    } finally {
      setUpdating(false);
    }
  }

  async function handleAddComment(e: React.FormEvent) {
    e.preventDefault();
    if (!commentText.trim()) return;

    setSubmittingComment(true);
    try {
      const res = await fetch(`/api/tickets/${ticketId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: commentText, isInternal }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add comment");
      }

      const newComment: Comment = await res.json();
      setTicket((prev) =>
        prev ? { ...prev, comments: [...prev.comments, newComment] } : prev
      );
      setCommentText("");
      setIsInternal(false);
      toast.success(isInternal ? "Internal note added" : "Comment added");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to add comment";
      toast.error(message);
    } finally {
      setSubmittingComment(false);
    }
  }

  if (loading) {
    return (
      <DashboardShell requiredRole="ADMIN">
        <div className="space-y-6 max-w-5xl">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-6 w-96" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Skeleton className="h-64 lg:col-span-2" />
            <Skeleton className="h-64" />
          </div>
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </DashboardShell>
    );
  }

  if (!ticket) {
    return null;
  }

  return (
    <DashboardShell requiredRole="ADMIN">
      <div className="space-y-6 max-w-5xl">
        {/* Back Button */}
        <Link href="/admin/tickets" className={buttonVariants({ variant: "ghost", size: "sm" })}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Tickets
        </Link>

        {/* Ticket Header */}
        <div className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight">{ticket.title}</h1>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={ticket.status} />
            <PriorityBadge priority={ticket.priority} />
            <CategoryBadge category={ticket.category} />
            <span className="text-sm text-muted-foreground ml-2">
              Created{" "}
              {formatDistanceToNow(new Date(ticket.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{ticket.description}</p>
              </CardContent>
            </Card>

            {/* AI Classification Display */}
            {(ticket.aiCategory || ticket.aiPriority || ticket.aiSummary) && (
              <Card className="border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/20">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Sparkles className="h-5 w-5 text-purple-500" />
                    AI Classification vs Human Override
                  </CardTitle>
                  <CardDescription>
                    Comparison of AI suggestions and human overrides
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase">
                        AI Suggested
                      </p>
                      <div className="space-y-2">
                        {ticket.aiCategory && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Category</p>
                            <CategoryBadge category={ticket.aiCategory} />
                          </div>
                        )}
                        {ticket.aiPriority && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Priority</p>
                            <PriorityBadge priority={ticket.aiPriority} />
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase">
                        Human Override
                      </p>
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs text-muted-foreground mb-0.5">Category</p>
                          {ticket.humanCategory ? (
                            <CategoryBadge category={ticket.humanCategory} />
                          ) : (
                            <span className="text-xs text-muted-foreground italic">
                              No override
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-0.5">Priority</p>
                          {ticket.humanPriority ? (
                            <PriorityBadge priority={ticket.humanPriority} />
                          ) : (
                            <span className="text-xs text-muted-foreground italic">
                              No override
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {ticket.aiSummary && (
                      <div className="sm:col-span-2">
                        <p className="text-xs font-medium text-muted-foreground mb-1">
                          AI Summary
                        </p>
                        <p className="text-sm">{ticket.aiSummary}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Comments Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <MessageSquare className="h-5 w-5" />
                  Comments ({ticket.comments.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {ticket.comments.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No comments yet. Start the conversation below.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {ticket.comments.map((comment) => (
                      <div key={comment.id} className="space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm">
                            {comment.user.name}
                          </span>
                          <Badge
                            variant="secondary"
                            className={roleBadgeVariant[comment.user.role]}
                          >
                            {comment.user.role.charAt(0) +
                              comment.user.role.slice(1).toLowerCase()}
                          </Badge>
                          {comment.isInternal && (
                            <Badge variant="outline" className="text-amber-600 border-amber-300">
                              Internal Note
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(comment.createdAt), {
                              addSuffix: true,
                            })}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">
                          {comment.content}
                        </p>
                        <Separator />
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Comment Form */}
                <form onSubmit={handleAddComment} className="space-y-3 pt-2">
                  <Textarea
                    placeholder="Write a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    rows={3}
                    disabled={submittingComment}
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="internal"
                        checked={isInternal}
                        onCheckedChange={(checked) =>
                          setIsInternal(checked === true)
                        }
                        disabled={submittingComment}
                      />
                      <Label
                        htmlFor="internal"
                        className="text-sm text-muted-foreground cursor-pointer"
                      >
                        Internal Note (not visible to customer)
                      </Label>
                    </div>
                    <Button
                      type="submit"
                      size="sm"
                      disabled={submittingComment || !commentText.trim()}
                    >
                      {submittingComment ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="mr-2 h-4 w-4" />
                      )}
                      {submittingComment ? "Sending..." : "Send"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Activity Log */}
            {ticket.activities.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Clock className="h-5 w-5" />
                    Activity Log
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative space-y-4">
                    <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border" />
                    {ticket.activities.map((activity) => (
                      <div key={activity.id} className="flex gap-4 relative">
                        <div className="mt-1.5 h-3.5 w-3.5 rounded-full border-2 border-primary bg-background z-10 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{activity.action}</p>
                          {activity.details && (
                            <p className="text-xs text-muted-foreground">
                              {activity.details}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            by {activity.user.name}{" "}
                            {formatDistanceToNow(new Date(activity.createdAt), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column: Admin Controls + Info */}
          <div className="space-y-6">
            {/* Admin Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Settings className="h-5 w-5" />
                  Admin Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Status */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Status</Label>
                  <Select
                    value={ticket.status}
                    onValueChange={(value) => { if (value !== null) handleUpdateTicket({ status: value }); }}
                    disabled={updating}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OPEN">Open</SelectItem>
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                      <SelectItem value="RESOLVED">Resolved</SelectItem>
                      <SelectItem value="CLOSED">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Assign Agent */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Assigned Agent</Label>
                  <Select
                    value={ticket.assignedAgent?.id ?? "UNASSIGNED"}
                    onValueChange={(value) => { if (value !== null) handleUpdateTicket({
                        assignedAgentId: value === "UNASSIGNED" ? null : value,
                      }); }}
                    disabled={updating}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UNASSIGNED">Unassigned</SelectItem>
                      {agents.map((agent) => (
                        <SelectItem key={agent.id} value={agent.id}>
                          {agent.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Override Category */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Override Category</Label>
                  <Select
                    value={ticket.humanCategory ?? "NONE"}
                    onValueChange={(value) => { if (value !== null) handleUpdateTicket({
                        humanCategory: value === "NONE" ? null : value,
                        category: value === "NONE" ? (ticket.aiCategory ?? ticket.category) : value,
                      }); }}
                    disabled={updating}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NONE">No Override</SelectItem>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Override Priority */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Override Priority</Label>
                  <Select
                    value={ticket.humanPriority ?? "NONE"}
                    onValueChange={(value) => { if (value !== null) handleUpdateTicket({
                        humanPriority: value === "NONE" ? null : value,
                        priority: value === "NONE" ? (ticket.aiPriority ?? ticket.priority) : value,
                      }); }}
                    disabled={updating}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NONE">No Override</SelectItem>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="URGENT">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Customer Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <User className="h-5 w-5" />
                  Customer Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="text-xs text-muted-foreground">Name</p>
                  <p className="text-sm font-medium">{ticket.customer.name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm">{ticket.customer.email}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
