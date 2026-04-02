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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import {
  ArrowLeft,
  Loader2,
  MessageSquare,
  Send,
  Sparkles,
  Clock,
  User,
  ShieldAlert,
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
  createdAt: string;
  updatedAt: string;
  customer: { id: string; name: string; email: string };
  assignedAgent: { id: string; name: string; email: string } | null;
  comments: Comment[];
  activities: Activity[];
}

const roleBadgeVariant: Record<Role, string> = {
  ADMIN: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  AGENT: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  CUSTOMER:
    "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
};

const STATUS_OPTIONS: { value: Status; label: string }[] = [
  { value: "OPEN", label: "Open" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "CLOSED", label: "Closed" },
];

export default function AgentTicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = params.id as string;

  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchTicket() {
      try {
        const res = await fetch(`/api/tickets/${ticketId}`);
        if (!res.ok) {
          if (res.status === 404) {
            toast.error("Ticket not found");
            router.push("/agent/tickets");
            return;
          }
          throw new Error("Failed to fetch ticket");
        }
        const data: TicketDetail = await res.json();
        if (!cancelled) {
          setTicket(data);
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

    fetchTicket();
    return () => {
      cancelled = true;
    };
  }, [ticketId, router]);

  async function handleStatusChange(newStatus: string) {
    if (!ticket || newStatus === ticket.status) return;

    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update status");
      }

      const updated: TicketDetail = await res.json();
      setTicket(updated);
      toast.success(`Status updated to ${newStatus.replace("_", " ").toLowerCase()}`);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update status";
      toast.error(message);
    } finally {
      setUpdatingStatus(false);
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
      <DashboardShell requiredRole="AGENT">
        <div className="space-y-6 max-w-4xl">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-6 w-96" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </DashboardShell>
    );
  }

  if (!ticket) {
    return null;
  }

  return (
    <DashboardShell requiredRole="AGENT">
      <div className="space-y-6 max-w-4xl">
        {/* Back Button */}
        <Link href="/agent/tickets" className={buttonVariants({ variant: "ghost", size: "sm" })}>
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

        {/* Agent Controls */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Agent Controls</CardTitle>
            <CardDescription>Update the ticket status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Label htmlFor="status-select" className="text-sm font-medium">
                Status
              </Label>
              <Select
                value={ticket.status}
                onValueChange={(value) => { if (value !== null) handleStatusChange(value); }}
                disabled={updatingStatus}
              >
                <SelectTrigger id="status-select" className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {updatingStatus && (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>
          </CardContent>
        </Card>

        {/* AI Classification */}
        {(ticket.aiCategory || ticket.aiPriority || ticket.aiSummary) && (
          <Card className="border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/20">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="h-5 w-5 text-purple-500" />
                AI Classification
              </CardTitle>
              <CardDescription>
                Automatically analyzed by our AI system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {ticket.aiCategory && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      Category
                    </p>
                    <CategoryBadge category={ticket.aiCategory} />
                  </div>
                )}
                {ticket.aiPriority && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      Priority
                    </p>
                    <PriorityBadge priority={ticket.aiPriority} />
                  </div>
                )}
                {ticket.aiSummary && (
                  <div className="sm:col-span-3">
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      Summary
                    </p>
                    <p className="text-sm">{ticket.aiSummary}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Customer Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-5 w-5" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Name
                </p>
                <p className="text-sm font-medium">{ticket.customer.name}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Email
                </p>
                <p className="text-sm">{ticket.customer.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Description */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{ticket.description}</p>
          </CardContent>
        </Card>

        {/* Comments */}
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
                  <div
                    key={comment.id}
                    className={
                      comment.isInternal
                        ? "space-y-2 border-l-4 border-amber-400 bg-amber-50/50 dark:bg-amber-950/20 p-3 rounded-r-md"
                        : "space-y-2"
                    }
                  >
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
                        <Badge
                          variant="secondary"
                          className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300"
                        >
                          <ShieldAlert className="mr-1 h-3 w-3" />
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
                    {!comment.isInternal && <Separator />}
                    {comment.isInternal && <div className="h-0" />}
                  </div>
                ))}
              </div>
            )}

            {/* Add Comment Form */}
            <form onSubmit={handleAddComment} className="space-y-3 pt-2">
              <Textarea
                placeholder={
                  isInternal
                    ? "Write an internal note (only visible to agents and admins)..."
                    : "Write a comment..."
                }
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                rows={3}
                disabled={submittingComment}
                className={
                  isInternal
                    ? "border-amber-300 focus-visible:ring-amber-400"
                    : ""
                }
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="internal-note"
                    checked={isInternal}
                    onCheckedChange={(checked) =>
                      setIsInternal(checked === true)
                    }
                    disabled={submittingComment}
                  />
                  <Label
                    htmlFor="internal-note"
                    className="text-sm font-medium cursor-pointer"
                  >
                    Mark as internal note
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
                  {submittingComment
                    ? "Sending..."
                    : isInternal
                      ? "Add Internal Note"
                      : "Send Comment"}
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
                {/* Timeline line */}
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
    </DashboardShell>
  );
}
