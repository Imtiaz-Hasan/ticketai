"use client";

import { useEffect, useState, useCallback } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { EmptyState } from "@/components/empty-state";
import { Pagination } from "@/components/pagination";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { createUserSchema } from "@/lib/validators";
import { Search, Plus, Pencil, UserX, Loader2 } from "lucide-react";
import { Role } from "@prisma/client";

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count: {
    tickets: number;
    assigned: number;
  };
}

interface UsersResponse {
  data: UserItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  role?: string;
}

const roleBadgeStyles: Record<Role, string> = {
  ADMIN: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  AGENT: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  CUSTOMER: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Create user dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [createRole, setCreateRole] = useState<string>("CUSTOMER");
  const [createErrors, setCreateErrors] = useState<FormErrors>({});
  const [creating, setCreating] = useState(false);

  // Edit user dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editUser, setEditUser] = useState<UserItem | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState<string>("CUSTOMER");
  const [editActive, setEditActive] = useState(true);
  const [editErrors, setEditErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("pageSize", "10");
      if (search) params.set("search", search);
      if (roleFilter) params.set("role", roleFilter);
      if (statusFilter) params.set("isActive", statusFilter);

      const res = await fetch(`/api/users?${params.toString()}`);
      if (!res.ok) {
        throw new Error("Failed to fetch users");
      }
      const data: UsersResponse = await res.json();
      setUsers(data.data);
      setTotalPages(data.totalPages);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter, statusFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    setPage(1);
  }, [search, roleFilter, statusFilter]);

  function resetCreateForm() {
    setCreateName("");
    setCreateEmail("");
    setCreatePassword("");
    setCreateRole("CUSTOMER");
    setCreateErrors({});
  }

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    setCreateErrors({});

    const input = {
      name: createName,
      email: createEmail,
      password: createPassword,
      role: createRole,
    };

    const validation = createUserSchema.safeParse(input);
    if (!validation.success) {
      const fieldErrors: FormErrors = {};
      for (const issue of validation.error.issues) {
        const field = issue.path[0] as keyof FormErrors;
        fieldErrors[field] = issue.message;
      }
      setCreateErrors(fieldErrors);
      return;
    }

    setCreating(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create user");
      }

      toast.success("User created successfully");
      setCreateOpen(false);
      resetCreateForm();
      fetchUsers();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create user";
      toast.error(message);
    } finally {
      setCreating(false);
    }
  }

  function openEditDialog(user: UserItem) {
    setEditUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditRole(user.role);
    setEditActive(user.isActive);
    setEditErrors({});
    setEditOpen(true);
  }

  async function handleEditUser(e: React.FormEvent) {
    e.preventDefault();
    if (!editUser) return;
    setEditErrors({});

    const updates: Record<string, unknown> = {};
    if (editName !== editUser.name) updates.name = editName;
    if (editEmail !== editUser.email) updates.email = editEmail;
    if (editRole !== editUser.role) updates.role = editRole;
    if (editActive !== editUser.isActive) updates.isActive = editActive;

    if (Object.keys(updates).length === 0) {
      toast.info("No changes to save");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/users/${editUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update user");
      }

      toast.success("User updated successfully");
      setEditOpen(false);
      setEditUser(null);
      fetchUsers();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update user";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDeactivateUser(userId: string) {
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: false }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to deactivate user");
      }

      toast.success("User deactivated successfully");
      fetchUsers();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to deactivate user";
      toast.error(message);
    }
  }

  return (
    <DashboardShell requiredRole="ADMIN">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
            <p className="text-muted-foreground">
              Manage users, roles, and permissions
            </p>
          </div>

          {/* Create User Dialog */}
          <Dialog
            open={createOpen}
            onOpenChange={(open) => {
              setCreateOpen(open);
              if (!open) resetCreateForm();
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
                <DialogDescription>
                  Add a new user to the system. They will receive login credentials.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="create-name">Name</Label>
                  <Input
                    id="create-name"
                    value={createName}
                    onChange={(e) => setCreateName(e.target.value)}
                    disabled={creating}
                  />
                  {createErrors.name && (
                    <p className="text-sm text-destructive">{createErrors.name}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-email">Email</Label>
                  <Input
                    id="create-email"
                    type="email"
                    value={createEmail}
                    onChange={(e) => setCreateEmail(e.target.value)}
                    disabled={creating}
                  />
                  {createErrors.email && (
                    <p className="text-sm text-destructive">{createErrors.email}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-password">Password</Label>
                  <Input
                    id="create-password"
                    type="password"
                    value={createPassword}
                    onChange={(e) => setCreatePassword(e.target.value)}
                    disabled={creating}
                  />
                  {createErrors.password && (
                    <p className="text-sm text-destructive">
                      {createErrors.password}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Minimum 6 characters
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-role">Role</Label>
                  <Select value={createRole} onValueChange={(value) => { if (value !== null) setCreateRole(value); }} disabled={creating}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CUSTOMER">Customer</SelectItem>
                      <SelectItem value="AGENT">Agent</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  {createErrors.role && (
                    <p className="text-sm text-destructive">{createErrors.role}</p>
                  )}
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={creating}>
                    {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {creating ? "Creating..." : "Create User"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Select value={roleFilter} onValueChange={(value) => { if (value !== null) setRoleFilter(value); }}>
                <SelectTrigger>
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Roles</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="AGENT">Agent</SelectItem>
                  <SelectItem value="CUSTOMER">Customer</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={(value) => { if (value !== null) setStatusFilter(value); }}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : users.length === 0 ? (
              <EmptyState
                title="No users found"
                description="No users match your current filters. Try adjusting your search criteria."
              />
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Tickets</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {user.email}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={roleBadgeStyles[user.role]}
                          >
                            {user.role.charAt(0) + user.role.slice(1).toLowerCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={
                              user.isActive
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                            }
                          >
                            {user.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {user.role === "CUSTOMER"
                            ? user._count.tickets
                            : user.role === "AGENT"
                              ? user._count.assigned
                              : `${user._count.tickets}/${user._count.assigned}`}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                          {formatDistanceToNow(new Date(user.createdAt), {
                            addSuffix: true,
                          })}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(user)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            {user.isActive && (
                              <ConfirmDialog
                                trigger={
                                  <Button variant="ghost" size="sm">
                                    <UserX className="h-4 w-4 text-destructive" />
                                  </Button>
                                }
                                title="Deactivate User"
                                description={`Are you sure you want to deactivate ${user.name}? They will no longer be able to log in.`}
                                confirmLabel="Deactivate"
                                onConfirm={() => handleDeactivateUser(user.id)}
                                variant="destructive"
                              />
                            )}
                          </div>
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

        {/* Edit User Dialog */}
        <Dialog
          open={editOpen}
          onOpenChange={(open) => {
            setEditOpen(open);
            if (!open) setEditUser(null);
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Update user details and permissions.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditUser} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  disabled={saving}
                />
                {editErrors.name && (
                  <p className="text-sm text-destructive">{editErrors.name}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  disabled={saving}
                />
                {editErrors.email && (
                  <p className="text-sm text-destructive">{editErrors.email}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-role">Role</Label>
                <Select value={editRole} onValueChange={(value) => { if (value !== null) setEditRole(value); }} disabled={saving}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CUSTOMER">Customer</SelectItem>
                    <SelectItem value="AGENT">Agent</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-active">Status</Label>
                <Select
                  value={editActive ? "true" : "false"}
                  onValueChange={(v) => { if (v !== null) setEditActive(v === "true"); }}
                  disabled={saving}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardShell>
  );
}
