import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateUserSchema, updateProfileSchema } from "@/lib/validators";
import bcrypt from "bcryptjs";

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

    // ADMIN can get any user; others can only get their own profile
    if (session.user.role !== "ADMIN" && session.user.id !== id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            tickets: true,
            assigned: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
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

    const { id } = params;
    const isAdmin = session.user.role === "ADMIN";
    const isSelf = session.user.id === id;

    // ADMIN can update any user; others can only update their own profile
    if (!isAdmin && !isSelf) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();

    // Use different validation schemas based on role
    const schema = isAdmin ? updateUserSchema : updateProfileSchema;
    const validation = schema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const data = validation.data as Record<string, unknown>;

    // If password provided, hash it
    if (data.password && typeof data.password === "string") {
      data.password = await bcrypt.hash(data.password, 10);
    }

    // If email changed, check uniqueness
    if (data.email && typeof data.email === "string") {
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      });
      if (existingUser && existingUser.id !== id) {
        return NextResponse.json(
          { error: "A user with this email already exists" },
          { status: 400 }
        );
      }
    }

    const existingUser = await prisma.user.findUnique({
      where: { id },
    });
    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = params;

    if (session.user.id === id) {
      return NextResponse.json(
        { error: "You cannot deactivate your own account" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await prisma.user.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ message: "User deactivated successfully" });
  } catch (error) {
    console.error("Error deactivating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
