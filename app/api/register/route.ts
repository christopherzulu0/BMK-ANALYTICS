import { NextRequest, NextResponse } from "next/server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from '@/lib/prisma';

// Define validation schema for registration data
const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  DepartmentName: z.string().min(2, "Department Name must be at least 2 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  roleType: z.enum(["dispatcher", "DOE", "admin"]).default("dispatcher"),
});

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate input data
    const validationResult = registerSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { name, email, DepartmentName, password, roleType } = validationResult.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }



    // Find the role
    const userRole = await prisma.role.findUnique({
      where: { name: roleType }
    });

    if (!userRole) {
      return NextResponse.json(
        { error: "Role not found. Please contact administrator." },
        { status: 500 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        DepartmentName,
        password: hashedPassword,
        roleId: userRole.id, // Connect to Role
        location: "",
        phone_number: "",
        notes: "",

      },
      select: {
        id: true,
        name: true,
        email: true,
        DepartmentName: true,
        roleId: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      { message: "User registered successfully", user },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "An error occurred during registration" },
      { status: 500 }
    );
  }
}
