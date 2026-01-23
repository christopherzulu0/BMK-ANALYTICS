// app/api/shipments/route.ts
import { NextResponse } from 'next/server';
import {prisma} from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// PUT handler to update an existing shipment
export async function PUT(request: Request) {
  try {
    const body = await request.json();

    // Get the id from the request body
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Shipment ID is required' },
        { status: 400 }
      );
    }

    // Get current user for audit logging
    const session = await getServerSession(authOptions)
    const userId = session?.user?.email 
        ? (await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } }))?.id 
        : null

    // Find the shipment to update
    const shipment = await prisma.shipment.findUnique({
      where: { id }
    });

    if (!shipment) {
      return NextResponse.json(
        { error: 'Shipment not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {};
    const changes: string[] = []

    // Only update fields that are provided and not empty strings
    if (body.vessel_id !== undefined && body.vessel_id !== "") {
      if (body.vessel_id !== shipment.vessel_id) {
        changes.push(`Vessel: ${shipment.vessel_id || 'N/A'} → ${body.vessel_id}`)
      }
      updateData.vessel_id = body.vessel_id
    }
    if (body.supplier !== undefined) {
      if (body.supplier !== shipment.supplier) {
        changes.push(`Supplier: ${shipment.supplier} → ${body.supplier}`)
      }
      updateData.supplier = body.supplier
    }
    if (body.cargo_metric_tons !== undefined) {
      const newTons = parseFloat(body.cargo_metric_tons)
      if (newTons !== Number(shipment.cargo_metric_tons)) {
        changes.push(`Cargo: ${shipment.cargo_metric_tons} MT → ${newTons} MT`)
      }
      updateData.cargo_metric_tons = newTons
    }
    if (body.status !== undefined) {
      if (body.status !== shipment.status) {
        changes.push(`Status: ${shipment.status} → ${body.status}`)
      }
      updateData.status = body.status
    }
    if (body.estimated_day_of_arrival !== undefined) {
      const newEta = new Date(body.estimated_day_of_arrival)
      if (newEta.getTime() !== shipment.estimated_day_of_arrival.getTime()) {
        changes.push(`ETA: ${shipment.estimated_day_of_arrival.toISOString().split('T')[0]} → ${newEta.toISOString().split('T')[0]}`)
      }
      updateData.estimated_day_of_arrival = newEta
    }
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.destination !== undefined) {
      if (body.destination !== shipment.destination) {
        changes.push(`Destination: ${shipment.destination || 'N/A'} → ${body.destination}`)
      }
      updateData.destination = body.destination
    }

    // Update the shipment in the database
    const updatedShipment = await prisma.shipment.update({
      where: { id },
      data: updateData
    });

    console.log('API: Updated shipment:', updatedShipment);

    // Create audit log entry
    try {
      await prisma.auditLog.create({
        data: {
          userId: userId || null,
          action: "updated",
          resource: `Shipment:${id}`,
          details: `Updated shipment ${id} (${shipment.vessel_id || 'N/A'}). ${changes.length > 0 ? 'Changes: ' + changes.join(', ') : 'No changes specified'}`,
          status: "success",
        }
      })
    } catch (auditError: any) {
      console.error("Failed to create audit log:", auditError)
    }

    return NextResponse.json({ shipment: updatedShipment }, { status: 200 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to update shipment' },
      { status: 500 }
    );
  }
}

// GET handler to fetch all shipments
export async function GET(request: Request) {
  console.log('API: Fetching shipments data...');

  try {
    // Fetch shipments from the database
    const shipments = await prisma.shipment.findMany({
      orderBy: {
        date: 'desc'
      }
    });

    return NextResponse.json(shipments, { status: 200 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shipments' },
      { status: 500 }
    );
  }
}

// POST handler to add a new shipment
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.vessel_id || !body.supplier || !body.destination || !body.cargo_metric_tons || !body.status || !body.estimated_day_of_arrival) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get current user for audit logging
    const session = await getServerSession(authOptions)
    const userId = session?.user?.email 
        ? (await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } }))?.id 
        : null

    // Create new shipment in the database
    const newShipment = await prisma.shipment.create({
      data: {
        vessel_id: body.vessel_id || null,
        supplier: body.supplier,
        cargo_metric_tons: parseFloat(body.cargo_metric_tons),
        status: body.status,
        estimated_day_of_arrival: new Date(body.estimated_day_of_arrival),
        notes: body.notes || null,
        destination: body.destination || null,
      }
    });

    console.log('API: Added new shipment:', newShipment);

    // Create audit log entry
    try {
      await prisma.auditLog.create({
        data: {
          userId: userId || null,
          action: "created",
          resource: `Shipment:${newShipment.id}`,
          details: `Created shipment ${body.vessel_id || 'N/A'}. Supplier: ${body.supplier}, Cargo: ${body.cargo_metric_tons} MT, Destination: ${body.destination}, Status: ${body.status}, ETA: ${new Date(body.estimated_day_of_arrival).toISOString().split('T')[0]}`,
          status: "success",
        }
      })
    } catch (auditError: any) {
      console.error("Failed to create audit log:", auditError)
    }

    return NextResponse.json({ shipment: newShipment }, { status: 201 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to add shipment' },
      { status: 500 }
    );
  }
}

// DELETE handler to remove a shipment
export async function DELETE(request: Request) {
  try {
    const body = await request.json();

    // Get the id from the request body
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Shipment ID is required' },
        { status: 400 }
      );
    }

    // Get current user for audit logging
    const session = await getServerSession(authOptions)
    const userId = session?.user?.email 
        ? (await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } }))?.id 
        : null

    // Get shipment details before deletion
    const shipment = await prisma.shipment.findUnique({
      where: { id },
      select: { vessel_id: true, supplier: true, cargo_metric_tons: true, status: true, destination: true }
    })

    try {
      // Delete the shipment by ID
      await prisma.shipment.delete({
        where: { id }
      });

      console.log('API: Deleted shipment with ID:', id);

      // Create audit log entry
      try {
        await prisma.auditLog.create({
          data: {
            userId: userId || null,
            action: "deleted",
            resource: `Shipment:${id}`,
            details: `Deleted shipment ${id} (${shipment?.vessel_id || 'N/A'}). Supplier: ${shipment?.supplier || 'N/A'}, Cargo: ${shipment?.cargo_metric_tons || 'N/A'} MT, Status: ${shipment?.status || 'N/A'}, Destination: ${shipment?.destination || 'N/A'}`,
            status: "success",
          }
        })
      } catch (auditError: any) {
        console.error("Failed to create audit log:", auditError)
      }

      return NextResponse.json({ success: true }, { status: 200 });
    } catch (deleteError: any) {
      console.error('Delete error:', deleteError);
      if (deleteError.code === 'P2025') {
        return NextResponse.json(
          { error: 'Shipment not found' },
          { status: 404 }
        );
      }
      throw deleteError;
    }
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete shipment' },
      { status: 500 }
    );
  }
}
