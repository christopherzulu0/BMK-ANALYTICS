import { NextResponse } from 'next/server';
import {prisma} from '@/lib/prisma';

export async function GET() {
    try {
        // Get all users
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
                updatedAt: true,
                roleId: true,
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
            },
            orderBy: {
                name: "asc"
            }
        });

        return NextResponse.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

// POST to create a new user
export async function POST(request: Request) {
    try {
        const data = await request.json();

        // Validate required fields
        if (!data.name) {
            return new NextResponse("Name is required", { status: 400 });
        }
        if (!data.email) {
            return new NextResponse("Email is required", { status: 400 });
        }

        // Check if email already exists
        const existingUser = await prisma.user.findUnique({
            where: {
                email: data.email
            }
        });

        if (existingUser) {
            return new NextResponse("Email already in use", { status: 400 });
        }

        // Prepare user data
        const userData: any = {
            name: data.name,
            email: data.email,
            // Generate a temporary password (in a real app, you'd use a secure method)
            password: `temp_${Math.random().toString(36).substring(2, 10)}`,
            // Set default roleType
            roleType: (data.role || 'user').toLowerCase(),
            // Set DepartmentName (required field)
            DepartmentName: data.department || 'General'
        };

        // Handle role if provided
        if (data.role) {
            // Find the role by name
            const role = await prisma.role.findFirst({
                where: {
                    name: data.role
                }
            });

            if (role) {
                userData.roleId = role.id;
            } else {
                console.warn(`Role "${data.role}" not found in database`);
            }
        }

        // Handle department if provided
        if (data.department) {
            // Find the userRoleType by name (using RoleType model from Prisma schema)
            const userRoleType = await prisma.roleType.findFirst({
                where: {
                    name: data.department
                }
            });

            if (userRoleType) {
                userData.roleTypeId = userRoleType.id;
            } else {
                console.warn(`Department "${data.department}" not found in RoleType table`);
            }
        }

        console.log('Creating user with data:', JSON.stringify(userData));

        // Create the user
        const newUser = await prisma.user.create({
            data: userData,
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
            }
        });

        return NextResponse.json(newUser);
    } catch (error) {
        console.error('Error creating user:', error);
        // Provide more detailed error information
        if (error instanceof Error) {
            return new NextResponse(`Internal Server Error: ${error.message}`, { status: 500 });
        }
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
