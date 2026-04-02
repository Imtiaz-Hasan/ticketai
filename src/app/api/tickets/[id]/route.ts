import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateTicketSchema } from "@/lib/validators";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: {
        customer: { select: { id: true, name: true, email: true } },
        assignedAgent: { select: { id: true, name: true, email: true } },
        comments: {
          include: {
            user: { select: { id: true, name: true, email: true, role: true } },
          },
          orderBy: { createdAt: "asc" },
        },
        activities: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    // CUSTOMER can only see their own tickets
    if (session.user.role === "CUSTOMER" && ticket.customerId !== session.user.id) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    // AGENT can only see their assigned tickets
    if (session.user.role === "AGENT" && ticket.assignedAgentId !== session.user.id) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    // Filter out internal comments for customers
    if (session.user.role === "CUSTOMER") {
      ticket.comments = ticket.comments.filter((comment) => !comment.isInternal);
    }

    return NextResponse.json(ticket);
  } catch (error) {
    console.error("Error fetching ticket:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN" && session.user.role !== "AGENT") {
      return NextResponse.json(
        { error: "Only admins and agents can update tickets" },
        { status: 403 }
      );
    }

    const { id } = params;

    const body = await request.json();
    const validation = updateTicketSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Fetch existing ticket
    const existingTicket = await prisma.ticket.findUnique({
      where: { id },
      include: {
        assignedAgent: { select: { id: true, name: true } },
      },
    });

    if (!existingTicket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    // AGENT can only update their assigned tickets
    if (session.user.role === "AGENT" && existingTicket.assignedAgentId !== session.user.id) {
      return NextResponse.json(
        { error: "You can only update tickets assigned to you" },
        { status: 403 }
      );
    }

    // Create activity logs for changes
    const activityPromises: Promise<unknown>[] = [];

    if (data.status && data.status !== existingTicket.status) {
      activityPromises.push(
        prisma.activityLog.create({
          data: {
            action: "Status changed",
            details: `Status changed from ${existingTicket.status} to ${data.status}`,
            ticketId: id,
            userId: session.user.id,
          },
        })
      );
    }

    if (data.assignedAgentId !== undefined && data.assignedAgentId !== existingTicket.assignedAgentId) {
      if (data.assignedAgentId) {
        const agent = await prisma.user.findUnique({
          where: { id: data.assignedAgentId },
          select: { name: true },
        });
        activityPromises.push(
          prisma.activityLog.create({
            data: {
              action: "Ticket assigned",
              details: `Ticket assigned to ${agent?.name || "Unknown"}`,
              ticketId: id,
              userId: session.user.id,
            },
          })
        );
      } else {
        activityPromises.push(
          prisma.activityLog.create({
            data: {
              action: "Ticket unassigned",
              details: "Ticket assignment removed",
              ticketId: id,
              userId: session.user.id,
            },
          })
        );
      }
    }

    if (data.humanCategory !== undefined && data.humanCategory !== existingTicket.humanCategory) {
      activityPromises.push(
        prisma.activityLog.create({
          data: {
            action: "Category updated",
            details: `Human category set to ${data.humanCategory || "none"}`,
            ticketId: id,
            userId: session.user.id,
          },
        })
      );
    }

    if (data.humanPriority !== undefined && data.humanPriority !== existingTicket.humanPriority) {
      activityPromises.push(
        prisma.activityLog.create({
          data: {
            action: "Priority updated",
            details: `Human priority set to ${data.humanPriority || "none"}`,
            ticketId: id,
            userId: session.user.id,
          },
        })
      );
    }

    // Execute update and activity logs
    const [updatedTicket] = await Promise.all([
      prisma.ticket.update({
        where: { id },
        data,
        include: {
          customer: { select: { id: true, name: true, email: true } },
          assignedAgent: { select: { id: true, name: true, email: true } },
          comments: {
            include: {
              user: { select: { id: true, name: true, email: true, role: true } },
            },
            orderBy: { createdAt: "asc" },
          },
          activities: {
            include: {
              user: { select: { id: true, name: true, email: true } },
            },
            orderBy: { createdAt: "desc" },
          },
        },
      }),
      ...activityPromises,
    ]);

    return NextResponse.json(updatedTicket);
  } catch (error) {
    console.error("Error updating ticket:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
