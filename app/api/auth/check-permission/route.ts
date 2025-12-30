import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import {prisma} from '@/lib/prisma';
import { Prisma } from "@/lib/generated/prisma";


export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user with JWT
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || !token.email) {
      console.log("No authenticated user found in token");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userEmail = token.email;

    // 2. Parse request body to get the permission we want to check
    const { permission } = await req.json();
    console.log("Checking permission:", permission);

    // 3. Find the user with their role and permissions
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      include: {
        role: {
          include: {
            permissions: true,
          },
        },
      },
    });

    if (!user) {
      console.log("User not found in database:", userEmail);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.role) {
      console.log("User does not have a role assigned:", userEmail);
      return NextResponse.json({ hasPermission: false, message: "User has no role assigned." });
    }

    // 4. Check if the role has the given permission
    const hasPermission = user.role.permissions?.some((p) => p.name === permission) || false;

    console.log("User:", userEmail, "Has Permission:", hasPermission);

    return NextResponse.json({ hasPermission });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error("Prisma known request error:", error);
      return NextResponse.json(
        {
          error: "Database query error",
          code: error.code,
          details: error.message,
        },
        { status: 500 }
      );
    }

    if (error instanceof Prisma.PrismaClientInitializationError) {
      console.error("Database initialization error:", error);
      return NextResponse.json(
        {
          error: "Database connection error",
          message: "Unable to connect to the database. Please try again later.",
          details: error.message,
        },
        { status: 503 }
      );
    }

    console.error("Unhandled error checking permission:", error);
    return NextResponse.json(
      {
        error: "Failed to check permission",
        message: "An unexpected error occurred while checking permissions.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
