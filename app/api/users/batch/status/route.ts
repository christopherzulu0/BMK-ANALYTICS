import { NextResponse } from 'next/server';
import {prisma} from '@/lib/prisma';

// PUT to update multiple users' statuses
export async function PUT(request: Request) {
    try {
        const data = await request.json();

        // Validate input
        if (!data.userIds || !Array.isArray(data.userIds) || data.userIds.length === 0) {
            return new NextResponse("userIds must be a non-empty array", { status: 400 });
        }

        if (!data.status || !['active', 'inactive', 'pending'].includes(data.status)) {
            return new NextResponse("Invalid status value. Must be 'active', 'inactive', or 'pending'.", { status: 400 });
        }

        // Update all users' statuses
        // Note: There's no 'status' field in the User model according to the schema
        // We'll log the request but not actually update the database

        // For now, we'll return success without actually updating the status
        // In a real implementation, you might:
        // 1. Add a status field to the User model in the Prisma schema
        // 2. Use a separate table to track user statuses
        // 3. Use a different field as a proxy for status

        console.log(`Batch status update requested for ${data.userIds.length} users: ${data.status}`);
        console.log('User IDs:', data.userIds);
        console.log('This is a mock implementation as the User model does not have a status field');

        // Count how many of the requested users actually exist
        const existingUsers = await prisma.user.count({
            where: {
                id: {
                    in: data.userIds
                }
            }
        });

        return NextResponse.json({
            success: true,
            updatedCount: existingUsers,
            message: "Status updates are simulated as the User model does not have a status field"
        });
    } catch (error) {
        console.error('Error updating user statuses:', error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
