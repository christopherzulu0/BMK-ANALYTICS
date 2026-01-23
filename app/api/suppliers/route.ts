import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";




// GET all suppliers
export async function GET(request: NextRequest) {
  try {
    const suppliers = await prisma.supplier.findMany({
      orderBy: {
        createdAt: "desc",
      },
    })
    return NextResponse.json(suppliers)
  } catch (error) {
    console.error("Error fetching suppliers:", error)
    return NextResponse.json(
      { error: "Failed to fetch suppliers" },
      { status: 500 }
    )
  }
}

// POST create supplier
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      email,
      phone,
      location,
      rating = 0,
      activeShipments = 0,
      reliability = 0,
    } = body

    // Validate required fields
    if (!name || !email || !phone || !location) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Get current user for audit logging
    const session = await getServerSession(authOptions)
    const userId = session?.user?.email 
        ? (await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } }))?.id 
        : null

    const supplier = await prisma.supplier.create({
      data: {
        name,
        email,
        phone,
        location,
        rating: parseFloat(rating),
        activeShipments: parseInt(activeShipments),
        reliability: parseFloat(reliability),
      },
    })

    // Create audit log entry
    try {
      await prisma.auditLog.create({
        data: {
          userId: userId || null,
          action: "created",
          resource: `Supplier:${supplier.id}`,
          details: `Created supplier "${name}" (ID: ${supplier.id}). Email: ${email}, Phone: ${phone}, Location: ${location}, Rating: ${rating}`,
          status: "success",
        }
      })
    } catch (auditError: any) {
      console.error("Failed to create audit log:", auditError)
    }

    return NextResponse.json(supplier, { status: 201 })
  } catch (error: any) {
    console.error("Error creating supplier:", error)
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Supplier with this name or email already exists" },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { error: "Failed to create supplier" },
      { status: 500 }
    )
  }
}
