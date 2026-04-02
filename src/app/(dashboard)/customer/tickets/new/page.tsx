"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DashboardShell } from "@/components/dashboard-shell";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { createTicketSchema } from "@/lib/validators";
import { ArrowLeft, Loader2, Paperclip } from "lucide-react";

interface FieldErrors {
  title?: string;
  description?: string;
}

export default function CreateTicketPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const validation = createTicketSchema.safeParse({ title, description });
    if (!validation.success) {
      const fieldErrors: FieldErrors = {};
      for (const issue of validation.error.issues) {
        const field = issue.path[0] as keyof FieldErrors;
        fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create ticket");
      }

      const ticket: { id: string } = await res.json();
      toast.success("Ticket created successfully!");
      router.push(`/customer/tickets/${ticket.id}`);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create ticket";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <DashboardShell requiredRole="CUSTOMER">
      <div className="space-y-6 max-w-2xl">
        <div className="flex items-center gap-4">
          <Link href="/customer/tickets" className={buttonVariants({ variant: "ghost", size: "sm" })}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Tickets
          </Link>
        </div>

        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Create New Ticket
          </h1>
          <p className="text-muted-foreground">
            Describe your issue and our team will get back to you
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Ticket Details</CardTitle>
            <CardDescription>
              Provide as much detail as possible so we can help you quickly
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Brief summary of your issue"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={200}
                  disabled={submitting}
                />
                <div className="flex items-center justify-between">
                  {errors.title ? (
                    <p className="text-sm text-destructive">{errors.title}</p>
                  ) : (
                    <span />
                  )}
                  <p className="text-xs text-muted-foreground">
                    {title.length}/200
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Please describe your issue in detail. Include any relevant steps to reproduce, error messages, or screenshots..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={8}
                  maxLength={5000}
                  disabled={submitting}
                />
                <div className="flex items-center justify-between">
                  {errors.description ? (
                    <p className="text-sm text-destructive">
                      {errors.description}
                    </p>
                  ) : (
                    <span />
                  )}
                  <p className="text-xs text-muted-foreground">
                    {description.length}/5000
                  </p>
                </div>
              </div>

              {/* Attachment (disabled) */}
              <div className="space-y-2">
                <Label htmlFor="attachment" className="text-muted-foreground">
                  Attachment
                </Label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled
                    className="gap-2"
                  >
                    <Paperclip className="h-4 w-4" />
                    Attach File
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    Coming soon
                  </span>
                </div>
              </div>

              {/* Submit */}
              <div className="flex justify-end">
                <Button type="submit" disabled={submitting}>
                  {submitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {submitting ? "Creating..." : "Create Ticket"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
