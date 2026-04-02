"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { DashboardShell } from "@/components/dashboard-shell";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { updateProfileSchema } from "@/lib/validators";
import { Loader2 } from "lucide-react";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface FieldErrors {
  name?: string;
  password?: string;
}

export default function AgentProfilePage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});

  useEffect(() => {
    let cancelled = false;

    async function fetchProfile() {
      if (!session?.user?.id) return;

      try {
        const res = await fetch(`/api/users/${session.user.id}`);
        if (!res.ok) {
          throw new Error("Failed to fetch profile");
        }
        const data: UserProfile = await res.json();
        if (!cancelled) {
          setProfile(data);
          setName(data.name);
        }
      } catch {
        if (!cancelled) {
          toast.error("Failed to load profile");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchProfile();
    return () => {
      cancelled = true;
    };
  }, [session?.user?.id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const updateData: Record<string, string> = {};
    if (name !== profile?.name) {
      updateData.name = name;
    }
    if (password) {
      updateData.password = password;
    }

    if (Object.keys(updateData).length === 0) {
      toast.info("No changes to save");
      return;
    }

    const validation = updateProfileSchema.safeParse(updateData);
    if (!validation.success) {
      const fieldErrors: FieldErrors = {};
      for (const issue of validation.error.issues) {
        const field = issue.path[0] as keyof FieldErrors;
        fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/users/${profile?.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update profile");
      }

      const updated: UserProfile = await res.json();
      setProfile(updated);
      setName(updated.name);
      setPassword("");
      toast.success("Profile updated successfully");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update profile";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <DashboardShell requiredRole="AGENT">
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground">
            Manage your account settings
          </p>
        </div>

        {loading ? (
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-32" />
            </CardContent>
          </Card>
        ) : profile ? (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>
                    Update your name or change your password
                  </CardDescription>
                </div>
                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                  Agent
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email (read-only) */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    Email cannot be changed
                  </p>
                </div>

                {/* Role (read-only) */}
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input
                    id="role"
                    value={profile.role.charAt(0) + profile.role.slice(1).toLowerCase()}
                    disabled
                    className="bg-muted"
                  />
                </div>

                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={saving}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name}</p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Leave blank to keep current password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={saving}
                  />
                  {errors.password && (
                    <p className="text-sm text-destructive">
                      {errors.password}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Minimum 6 characters
                  </p>
                </div>

                {/* Submit */}
                <div className="flex justify-end">
                  <Button type="submit" disabled={saving}>
                    {saving && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </DashboardShell>
  );
}
