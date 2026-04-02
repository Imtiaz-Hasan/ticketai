import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createCommentSchema } from "@/lib/validators";
import { sanitizeText } from "@/lib/sanitize";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    const body = await request.json();
    const validation = createCommentSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { content, isInternal } = validation.data;

    // Fetch the ticket to verify access
    const ticket = await prisma.ticket.findUnique({
      where: { id },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    // CUSTOMER can only comment on their own tickets
    if (session.user.role === "CUSTOMER" && ticket.customerId !== session.user.id) {
      return NextResponse.json(
        { error: "You can only comment on your own tickets" },
        { status: 403 }
      );
    }

    // CUSTOMER cannot create internal comments
    if (session.user.role === "CUSTOMER" && isInternal) {
      return NextResponse.json(
        { error: "Customers cannot create internal notes" },
        { status: 403 }
      );
    }

    // AGENT can only comment on their assigned tickets
    if (session.user.role === "AGENT" && ticket.assignedAgentId !== session.user.id) {
      return NextResponse.json(
        { error: "You can only comment on tickets assigned to you" },
        { status: 403 }
      );
    }

    const sanitizedContent = sanitizeText(content);

    const comment = await prisma.comment.create({
      data: {
        content: sanitizedContent,
        isInternal: isInternal || false,
        ticketId: id,
        userId: session.user.id,
      },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    // Create activity log
    await prisma.activityLog.create({
      data: {
        action: isInternal ? "Internal note added" : "Comment added",
        ticketId: id,
        userId: session.user.id,
      },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
