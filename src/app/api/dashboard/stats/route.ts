import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const where: Record<string, unknown> = {};

    if (session.user.role === "CUSTOMER") {
      where.customerId = session.user.id;
    } else if (session.user.role === "AGENT") {
      where.assignedAgentId = session.user.id;
    }
    // ADMIN: no filter

    // Ticket counts by status
    const [totalTickets, openTickets, inProgressTickets, resolvedTickets, closedTickets] =
      await Promise.all([
        prisma.ticket.count({ where }),
        prisma.ticket.count({ where: { ...where, status: "OPEN" } }),
        prisma.ticket.count({ where: { ...where, status: "IN_PROGRESS" } }),
        prisma.ticket.count({ where: { ...where, status: "RESOLVED" } }),
        prisma.ticket.count({ where: { ...where, status: "CLOSED" } }),
      ]);

    // Group by category and priority
    const [ticketsByCategory, ticketsByPriority] = await Promise.all([
      prisma.ticket.groupBy({
        by: ["category"],
        _count: true,
        where,
      }),
      prisma.ticket.groupBy({
        by: ["priority"],
        _count: true,
        where,
      }),
    ]);

    // Tickets over time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const recentTicketsForChart = await prisma.ticket.findMany({
      where: {
        ...where,
        createdAt: { gte: thirtyDaysAgo },
      },
      select: {
        createdAt: true,
      },
    });

    // Group by date in JS
    const dateCounts: Record<string, number> = {};
    for (const ticket of recentTicketsForChart) {
      const dateStr = ticket.createdAt.toISOString().split("T")[0];
      dateCounts[dateStr] = (dateCounts[dateStr] || 0) + 1;
    }

    // Fill in missing dates with count 0
    const ticketsOverTime: { date: string; count: number }[] = [];
    const currentDate = new Date(thirtyDaysAgo);
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    while (currentDate <= today) {
      const dateStr = currentDate.toISOString().split("T")[0];
      ticketsOverTime.push({
        date: dateStr,
        count: dateCounts[dateStr] || 0,
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Recent tickets
    const recentTickets = await prisma.ticket.findMany({
      where,
      include: {
        customer: { select: { id: true, name: true, email: true } },
        assignedAgent: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return NextResponse.json({
      totalTickets,
      openTickets,
      inProgressTickets,
      resolvedTickets,
      closedTickets,
      ticketsByCategory: ticketsByCategory.map((item) => ({
        category: item.category,
        count: item._count,
      })),
      ticketsByPriority: ticketsByPriority.map((item) => ({
        priority: item.priority,
        count: item._count,
      })),
      ticketsOverTime,
      recentTickets,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
