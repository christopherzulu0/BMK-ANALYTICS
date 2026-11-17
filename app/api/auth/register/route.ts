import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { name, email, password, DepartmentName, location, phone_number, notes } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let userRole = await prisma.role.findUnique({
      where: { name: "User" },
    });

    if (!userRole) {
      userRole = await prisma.role.create({
        data: {
          name: "User",
          description: "User role with less privilege",
          isSystem: true,
        },
      });
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        DepartmentName: DepartmentName || "",
        location: location || "",
        phone_number: phone_number || "",
        notes: notes || "",
        status: "active",
        roleId: userRole.id,
      },
    });

    return NextResponse.json(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: userRole.name,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
