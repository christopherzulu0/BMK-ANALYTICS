import {prisma} from '@/lib/prisma';
import { NextResponse } from 'next/server';


export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const id = url.searchParams.get('id');

        if (id) {
            // Get a specific role by ID
            const role = await prisma.role.findUnique({
                where: { id: parseInt(id) },
                include: {
                    permissions: true,
                    users_rel: true
                }
            });

            if (!role) {
                return new NextResponse("Role not found", { status: 404 });
            }

            return NextResponse.json(role);
        } else {
            // Get all roles
            const roles = await prisma.role.findMany({
                include: {
                    permissions: true,
                    users_rel: true
                },
                orderBy: {
                    name: "asc"
                }
            });

            return NextResponse.json(roles);
        }
    } catch (error) {
        console.error('Error fetching roles:', error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, description, permissions = [], roleTypeId } = body;

        // Create a new role
        const role = await prisma.role.create({
            data: {
                name,
                description,
                permissions: {
                    connect: permissions.map((id: number) => ({ id }))
                },
                ...(roleTypeId && { roleTypeId: parseInt(roleTypeId) })
            },
            include: {
                permissions: true,
                users_rel: true
            }
        });

        return NextResponse.json(role, { status: 201 });
    } catch (error) {
        console.error('Error creating role:', error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, name, description, permissions = [], roleTypeId } = body;

        // Check if the role exists before updating
        const existingRole = await prisma.role.findUnique({ where: { id } });
        if (!existingRole) {
            return new NextResponse("Role not found", { status: 404 });
        }

        // Update an existing role
        const role = await prisma.role.update({
            where: { id },
            data: {
                name,
                description,
                permissions: {
                    set: permissions.map((id: number) => ({ id }))
                },
                ...(roleTypeId !== undefined && { roleTypeId: roleTypeId ? parseInt(roleTypeId) : null })
            },
            include: {
                permissions: true,
                users_rel: true
            }
        });

        return NextResponse.json(role);
    } catch (error) {
        console.error('Error updating role:', error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const url = new URL(request.url);
        const id = url.searchParams.get('id');

        if (!id) {
            return new NextResponse("Role ID is required", { status: 400 });
        }

        // Delete the role
        await prisma.role.delete({
            where: { id: parseInt(id) }
        });

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error('Error deleting role:', error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
