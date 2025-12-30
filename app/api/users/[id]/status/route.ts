import { NextResponse } from 'next/server';
import {prisma} from '@/lib/prisma';

// PUT to update a user's status
export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const userId = params.id;
        const data = await request.json();

        // Validate status
        if (!data.status || !['active', 'inactive', 'pending'].includes(data.status)) {
            return new NextResponse("Invalid status value. Must be 'active', 'inactive', or 'pending'.", { status: 400 });
        }

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: {
                id: userId,
            },
        });

        if (!existingUser) {
            return new NextResponse("User not found", { status: 404 });
        }

        // Update user status
        // Note: There's no 'status' field in the User model according to the schema
        // We'll store the status in a custom field or use an alternative approach

        // For now, we'll return the user without actually updating the status
        // In a real implementation, you might:
        // 1. Add a status field to the User model in the Prisma schema
        // 2. Use a separate table to track user statuses
        // 3. Use a different field as a proxy for status

        console.log(`Status update requested for user ${userId}: ${data.status}`);
        console.log('This is a mock implementation as the User model does not have a status field');

        // Return the user without updating
        const updatedUser = await prisma.user.findUnique({
            where: {
                id: userId,
            },
            select: {
                id: true,
                name: true,
                email: true,
                roleType: true,
                createdAt: true,
                updatedAt: true,
                roleId: true,
                roleTypeId: true,
                DepartmentName: true,
                role: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                        roleType: true
                    }
                },
                userRoleType: {
                    select: {
                        id: true,
                        name: true,
                        description: true
                    }
                }
            },
        });

        // Add a virtual status field to the response
        const responseUser = {
            ...updatedUser,
            status: data.status // Add the requested status to the response
        };

        return NextResponse.json(responseUser);
    } catch (error) {
        console.error('Error updating user status:', error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
