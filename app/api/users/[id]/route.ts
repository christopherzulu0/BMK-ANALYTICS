import { NextResponse } from 'next/server';
import {prisma} from '@/lib/prisma';

// GET a single user by ID
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const userId = params.id;

        const user = await prisma.user.findUnique({
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

        if (!user) {
            return new NextResponse("User not found", { status: 404 });
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

// PUT to update a user
export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        // Ensure params is properly awaited
        const { id: userId } = await Promise.resolve(params);
        const data = await request.json();

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: {
                id: userId,
            },
        });

        if (!existingUser) {
            return new NextResponse("User not found", { status: 404 });
        }

        // Update user data
        // Only update fields that are provided in the request
        const updateData: any = {};
        if (data.roleId) {
            updateData.role = { connect: { id: data.roleId } };
        }
        if (data.DepartmentName) {
            updateData.DepartmentName = data.DepartmentName;
        }
        if (data.location) {
            updateData.location = data.location;
        }
        if (data.phone_number) {
            updateData.phone_number = data.phone_number;
        }
        if (data.notes) {
            updateData.notes = data.notes;
        }
        // Handle phone field if provided (stored in a different way or not at all in the database)
        if (data.phone !== undefined) {
            // This field doesn't exist in the database schema, so we'll log it
            console.info(`Phone field provided but not stored in database: ${data.phone}`);
        }

        // Handle status field if provided (not in database schema)
        if (data.status !== undefined) {
            // This field doesn't exist in the database schema, so we'll log it
            console.info(`Status field provided but not stored in database: ${data.status}`);
        }

        // Don't update password through this endpoint for security reasons
        if (data.password !== undefined) {
            console.warn('Password update attempted through user update endpoint - ignored for security');
        }

        // Ensure DepartmentName is set if not already provided
        if (!updateData.DepartmentName && existingUser.DepartmentName) {
            updateData.DepartmentName = existingUser.DepartmentName;
        } else if (!updateData.DepartmentName && !existingUser.DepartmentName) {
            // If no department name is set, use a default
            updateData.DepartmentName = "General";
        }

        console.log('Updating user with data:', JSON.stringify(updateData));

        const updatedUser = await prisma.user.update({
            where: {
                id: userId,
            },
            data: updateData,
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
                updatedAt: true,
                DepartmentName: true,
                location: true,
                phone_number: true,
                notes: true,
                role: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                        isSystem: true,
                        createdAt: true,
                        updatedAt: true,
                    }
                }
            }
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error('Error updating user:', error);
        // Provide more detailed error information
        if (error instanceof Error) {
            return new NextResponse(`Internal Server Error: ${error.message}`, { status: 500 });
        }
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

// DELETE a user
export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const userId = params.id;

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: {
                id: userId,
            },
        });

        if (!existingUser) {
            return new NextResponse("User not found", { status: 404 });
        }

        // Delete the user
        await prisma.user.delete({
            where: {
                id: userId,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting user:', error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
