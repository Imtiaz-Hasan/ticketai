import { Role, Status, Priority } from "@prisma/client";

export type { Role, Status, Priority };

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface TicketWithRelations {
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
  customerId: string;
  assignedAgentId: string | null;
  createdAt: Date;
  updatedAt: Date;
  customer: {
    id: string;
    name: string;
    email: string;
  };
  assignedAgent: {
    id: string;
    name: string;
    email: string;
  } | null;
  comments: CommentWithUser[];
  activities: ActivityLogWithUser[];
}

export interface CommentWithUser {
  id: string;
  content: string;
  isInternal: boolean;
  ticketId: string;
  userId: string;
  createdAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
    role: Role;
  };
}

export interface ActivityLogWithUser {
  id: string;
  action: string;
  details: string | null;
  ticketId: string;
  userId: string;
  createdAt: Date;
  user: {
    id: string;
    name: string;
  };
}

export interface UserListItem {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: Date;
  _count: {
    tickets: number;
    assigned: number;
  };
}

export interface DashboardStats {
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  closedTickets: number;
  ticketsByCategory: { category: string; count: number }[];
  ticketsByPriority: { priority: string; count: number }[];
  ticketsOverTime: { date: string; count: number }[];
  recentTickets: TicketWithRelations[];
}

export interface AIClassificationResult {
  category: string;
  priority: string;
  summary: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiError {
  error: string;
}
