import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { classifyTicket } from "@/lib/ai";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description } = body;

    if (!title || typeof title !== "string") {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    if (!description || typeof description !== "string") {
      return NextResponse.json(
        { error: "Description is required" },
        { status: 400 }
      );
    }

    const result = await classifyTicket(title, description);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error classifying ticket:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
