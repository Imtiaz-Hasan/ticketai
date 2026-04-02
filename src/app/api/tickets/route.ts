import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createTicketSchema } from "@/lib/validators";
import { sanitizeText } from "@/lib/sanitize";
import { classifyTicket } from "@/lib/ai";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "10", 10)));
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const category = searchParams.get("category");
    const assignedAgentId = searchParams.get("assignedAgentId");
    const search = searchParams.get("search");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    const where: Record<string, unknown> = {};

    // Role-based filtering
    if (session.user.role === "CUSTOMER") {
      where.customerId = session.user.id;
    } else if (session.user.role === "AGENT") {
      where.assignedAgentId = session.user.id;
    }
    // ADMIN: no additional filter

    if (status) {
      where.status = status;
    }
    if (priority) {
      where.priority = priority;
    }
    if (category) {
      where.category = category;
    }
    if (assignedAgentId) {
      where.assignedAgentId = assignedAgentId;
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        (where.createdAt as Record<string, unknown>).gte = new Date(dateFrom);
      }
      if (dateTo) {
        (where.createdAt as Record<string, unknown>).lte = new Date(dateTo);
      }
    }

    const [data, total] = await Promise.all([
      prisma.ticket.findMany({
        where,
        include: {
          customer: { select: { id: true, name: true, email: true } },
          assignedAgent: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.ticket.count({ where }),
    ]);

    return NextResponse.json({
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "CUSTOMER") {
      return NextResponse.json(
        { error: "Only customers can create tickets" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = createTicketSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { title, description } = validation.data;
    const sanitizedTitle = sanitizeText(title);
    const sanitizedDescription = sanitizeText(description);

    const ticket = await prisma.ticket.create({
      data: {
        title: sanitizedTitle,
        description: sanitizedDescription,
        customerId: session.user.id,
      },
      include: {
        customer: { select: { id: true, name: true, email: true } },
        assignedAgent: { select: { id: true, name: true, email: true } },
      },
    });

    // AI classification (non-blocking)
    try {
      const aiResult = await classifyTicket(sanitizedTitle, sanitizedDescription);
      await prisma.ticket.update({
        where: { id: ticket.id },
        data: {
          aiCategory: aiResult.category,
          aiPriority: aiResult.priority,
          aiSummary: aiResult.summary,
          category: aiResult.category,
        },
      });
    } catch (aiError) {
      console.error("AI classification failed:", aiError);
    }

    // Create activity log
    await prisma.activityLog.create({
      data: {
        action: "Ticket created",
        ticketId: ticket.id,
        userId: session.user.id,
      },
    });

    // Re-fetch to include any AI updates
    const updatedTicket = await prisma.ticket.findUnique({
      where: { id: ticket.id },
      include: {
        customer: { select: { id: true, name: true, email: true } },
        assignedAgent: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json(updatedTicket, { status: 201 });
  } catch (error) {
    console.error("Error creating ticket:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
