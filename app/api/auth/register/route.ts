import { NextResponse } from "next/server";
import {prisma} from '@/lib/prisma';
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { name, email, password,DepartmentName,location, phone_number,notes } = await request.json();

    // Validate input
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

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Find or create the dispatcher role type
    let userRoleType = await prisma.role.findUnique({
      where: { name: "User" }
    });

    if (!userRoleType) {
      // Create the dispatcher role type if it doesn't exist
      userRoleType = await prisma.role.create({
        data: {
          name: "User",
          description: "User role with less privilege"
        }
      });
      // console.log("Created dispatcher role type");
    }

    // Find or create the dispatcher role
    let userRole = await prisma.role.findUnique({
      where: { name: "User" }
    });

    if (!userRole) {
      // Create the dispatcher role if it doesn't exist
      userRole = await prisma.role.create({
        data: {
          name: "User",
          description: "User role with less privilege",
          isSystem: true,
          roleTypeId: userRoleType.id
        }
      });
      // console.log("Created dispatcher role");
    }

    // Create user with proper role relations
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        DepartmentName,
        location: location || "",
        phone_number:  phone_number || "",
        notes: notes || "",
        roleId: userRole.id, // Connect to Role
       
      },
    });

    // Return success without exposing the password
    return NextResponse.json(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: userRole?.name ?? null,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "An error occurred during registration" },
      { status: 500 }
    );
  }
}
