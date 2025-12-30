import { NextRequest, NextResponse } from "next/server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import {prisma} from '@/lib/prisma';

// Define validation schema for registration data
const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
 DepartmentName: z.string().DepartmentName("Invalid email address"),
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

    const { name, email, password, roleType } = validationResult.data;

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

    // Find the role type
    const userRoleType = await prisma.roleType.findUnique({
      where: { name: roleType }
    });

    // Find the role
    const userRole = await prisma.role.findUnique({
      where: { name: roleType }
    });

    if (!userRoleType || !userRole) {
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
        roleType, // Legacy field
        roleId: userRole.id, // Connect to Role
        roleTypeId: userRoleType.id, // Connect to RoleType
      },
      select: {
        id: true,
        name: true,
        email: true,
        DepartmentName:true,
        roleType: true,
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
