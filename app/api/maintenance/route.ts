// app/api/maintenance/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET handler to fetch maintenance tasks
export async function GET(request: Request) {
  console.log('API: Fetching maintenance data...');

  try {
    const url = new URL(request.url);
    
    // Get query parameters
    const status = url.searchParams.get('status') || undefined;
    const tankId = url.searchParams.get('tankId') || undefined;
    const limit = parseInt(url.searchParams.get('limit') || '100');

    // Build where clause
    const where: any = {};
    if (status) {
      where.status = status;
    }
    if (tankId) {
      where.tankId = tankId;
    }

    // Fetch maintenance tasks from the database
    const maintenanceData = await prisma.maintenance.findMany({
      where,
      orderBy: {
        date: 'desc'
      },
      take: limit
    });

    return NextResponse.json({ maintenanceData }, { status: 200 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch maintenance data' },
      { status: 500 }
    );
  }
}

// POST handler to create a new maintenance task
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.tankId || !body.date || !body.description || !body.status) {
      return NextResponse.json(
        { error: 'Missing required fields: tankId, date, description, and status are required' },
        { status: 400 }
      );
    }

    // Get current user for audit logging
    const session = await getServerSession(authOptions)
    const userId = session?.user?.email 
        ? (await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } }))?.id 
        : null

    // Create a new maintenance task
    const newMaintenance = await prisma.maintenance.create({
      data: {
        tankId: body.tankId,
        date: new Date(body.date),
        description: body.description,
        technician: body.technician || '',
        status: body.status,
      }
    });

    console.log('API: Created new maintenance task:', newMaintenance);

    // Create audit log entry
    try {
      await prisma.auditLog.create({
        data: {
          userId: userId || null,
          action: "created",
          resource: `Maintenance:${body.tankId}`,
          details: `Created maintenance task for tank ${body.tankId}. Type: ${body.description}, Status: ${body.status}, Due: ${new Date(body.date).toISOString().split('T')[0]}`,
          status: "success",
        }
      })
    } catch (auditError: any) {
      console.error("Failed to create audit log:", auditError)
    }

    return NextResponse.json({ maintenance: newMaintenance }, { status: 201 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to create maintenance task' },
      { status: 500 }
    );
  }
}

// PUT handler to update a maintenance task
export async function PUT(request: Request) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.id) {
      return NextResponse.json(
        { error: 'Maintenance task ID is required' },
        { status: 400 }
      );
    }

    // Get current user for audit logging
    const session = await getServerSession(authOptions)
    const userId = session?.user?.email 
        ? (await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } }))?.id 
        : null

    // Get existing maintenance task for audit details
    const existingMaintenance = await prisma.maintenance.findUnique({
      where: { id: body.id },
      select: { tankId: true, status: true, description: true }
    })

    // Build update data
    const updateData: any = {};
    if (body.status !== undefined) updateData.status = body.status;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.technician !== undefined) updateData.technician = body.technician;
    if (body.date !== undefined) updateData.date = new Date(body.date);
    if (body.tankId !== undefined) updateData.tankId = body.tankId;

    // Update the maintenance task
    const updatedMaintenance = await prisma.maintenance.update({
      where: {
        id: body.id
      },
      data: updateData
    });

    console.log('API: Updated maintenance task:', updatedMaintenance);

    // Create audit log entry
    try {
      const changes: string[] = []
      if (body.status !== undefined && body.status !== existingMaintenance?.status) {
        changes.push(`Status: ${existingMaintenance?.status} → ${body.status}`)
      }
      if (body.description !== undefined && body.description !== existingMaintenance?.description) {
        changes.push(`Description updated`)
      }
      if (body.tankId !== undefined && body.tankId !== existingMaintenance?.tankId) {
        changes.push(`Tank: ${existingMaintenance?.tankId} → ${body.tankId}`)
      }

      await prisma.auditLog.create({
        data: {
          userId: userId || null,
          action: "updated",
          resource: `Maintenance:${updatedMaintenance.tankId}`,
          details: `Updated maintenance task ${body.id} for tank ${updatedMaintenance.tankId}. ${changes.length > 0 ? 'Changes: ' + changes.join(', ') : 'No changes specified'}`,
          status: "success",
        }
      })
    } catch (auditError: any) {
      console.error("Failed to create audit log:", auditError)
    }

    return NextResponse.json({ maintenance: updatedMaintenance }, { status: 200 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to update maintenance task' },
      { status: 500 }
    );
  }
}

// DELETE handler to delete a maintenance task
export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Maintenance task ID is required' },
        { status: 400 }
      );
    }

    // Get current user for audit logging
    const session = await getServerSession(authOptions)
    const userId = session?.user?.email 
        ? (await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } }))?.id 
        : null

    // Get maintenance task details before deletion
    const maintenanceTask = await prisma.maintenance.findUnique({
      where: { id },
      select: { tankId: true, description: true, status: true }
    })

    await prisma.maintenance.delete({
      where: {
        id: id
      }
    });

    console.log('API: Deleted maintenance task:', id);

    // Create audit log entry
    try {
      await prisma.auditLog.create({
        data: {
          userId: userId || null,
          action: "deleted",
          resource: `Maintenance:${maintenanceTask?.tankId || 'unknown'}`,
          details: `Deleted maintenance task ${id} for tank ${maintenanceTask?.tankId || 'unknown'}. Task: ${maintenanceTask?.description || 'N/A'}, Status: ${maintenanceTask?.status || 'N/A'}`,
          status: "success",
        }
      })
    } catch (auditError: any) {
      console.error("Failed to create audit log:", auditError)
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete maintenance task' },
      { status: 500 }
    );
  }
}

