import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"


// PUT update supplier
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const supplier = await prisma.supplier.update({
      where: { id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.email && { email: body.email }),
        ...(body.phone && { phone: body.phone }),
        ...(body.location && { location: body.location }),
        ...(body.rating !== undefined && { rating: parseFloat(body.rating) }),
        ...(body.activeShipments !== undefined && {
          activeShipments: parseInt(body.activeShipments),
        }),
        ...(body.reliability !== undefined && {
          reliability: parseFloat(body.reliability),
        }),
      },
    })

    return NextResponse.json(supplier)
  } catch (error: any) {
    console.error("Error updating supplier:", error)
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Supplier not found" },
        { status: 404 }
      )
    }
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Supplier with this name or email already exists" },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { error: "Failed to update supplier" },
      { status: 500 }
    )
  }
}

// DELETE supplier
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.supplier.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error deleting supplier:", error)
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Supplier not found" },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: "Failed to delete supplier" },
      { status: 500 }
    )
  }
}
