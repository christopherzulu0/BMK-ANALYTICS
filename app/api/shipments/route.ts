// app/api/shipments/route.ts
import { NextResponse } from 'next/server';
import {prisma} from '@/lib/prisma';

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

    // Only update fields that are provided
    if (body.vessel_id !== undefined) updateData.vessel_id = parseInt(body.vessel_id);
    if (body.supplier !== undefined) updateData.supplier = body.supplier;
    if (body.cargo_metric_tons !== undefined) updateData.cargo_metric_tons = parseFloat(body.cargo_metric_tons);
    if (body.status !== undefined) updateData.status = body.status;
    if (body.estimated_day_of_arrival !== undefined) updateData.estimated_day_of_arrival = new Date(body.estimated_day_of_arrival);
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.destination !== undefined) updateData.destination = body.destination;
    if (body.progress !== undefined) updateData.progress = body.progress;

    // Update the shipment in the database
    const updatedShipment = await prisma.shipment.update({
      where: { id },
      data: updateData
    });

    console.log('API: Updated shipment:', updatedShipment);

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

    return NextResponse.json({ shipments }, { status: 200 });
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

    // Create new shipment in the database
    // Ensure vessel_id is stored as a number
    const newShipment = await prisma.shipment.create({
      data: {
        vessel_id: body.vessel_id,
        supplier: body.supplier,
        cargo_metric_tons: parseFloat(body.cargo_metric_tons),
        status: body.status,
        estimated_day_of_arrival: new Date(body.estimated_day_of_arrival),
        notes: body.notes || null,
        destination: body.destination || null,
        progress: body.progress || 0
      }
    });

    console.log('API: Added new shipment:', newShipment);

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
    // Get the URL from the request
    const url = new URL(request.url);

    // Get the id from the query parameters
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Shipment ID is required' },
        { status: 400 }
      );
    }

    try {
      // First try to delete directly by ID (assuming it's the primary key)
      await prisma.shipment.delete({
        where: { id }
      });

      console.log('API: Deleted shipment with ID:', id);
      return NextResponse.json({ success: true }, { status: 200 });
    } catch (deleteError) {
      // If direct deletion fails, try to find by vessel_id as a fallback
      console.log('Direct deletion failed, trying to find by vessel_id');

      const shipmentId = parseInt(id);
      const shipments = await prisma.shipment.findMany({
        where: { vessel_id: shipmentId }
      });

      if (shipments.length === 0) {
        return NextResponse.json(
          { error: 'Shipment not found' },
          { status: 404 }
        );
      }

      // Remove from database
      // Delete the first matching shipment
      await prisma.shipment.delete({
        where: { id: shipments[0].id }
      });

      console.log('API: Deleted shipment with vessel_id:', id);
      return NextResponse.json({ success: true }, { status: 200 });
    }
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete shipment' },
      { status: 500 }
    );
  }
}
