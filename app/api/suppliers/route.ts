import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"




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
