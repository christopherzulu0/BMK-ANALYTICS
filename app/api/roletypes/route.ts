import {prisma} from '@/lib/prisma';
import { NextResponse } from 'next/server';


export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const id = url.searchParams.get('id');

        if (id) {
            // Get a specific role type by ID
            const roleType = await prisma.roleType.findUnique({
                where: { id: parseInt(id) },
                include: { 
                  roles: {
                    include: {
                      users_rel: true,
                      permissions: true
                    }
                  }
                }
            });

            if (!roleType) {
                return new NextResponse("Role type not found", { status: 404 });
            }

            // Map roles to include userCount and permission names
            const mappedRoleType = {
              ...roleType,
              roles: roleType.roles.map(role => ({
                ...role,
                userCount: role.users_rel ? role.users_rel.length : 0,
                permissions: role.permissions ? role.permissions.map(p => p.name) : []
              }))
            };

            return NextResponse.json(mappedRoleType);
        } else {
            // Get all role types
            const roleTypes = await prisma.roleType.findMany({
                include: {
                    roles: {
                        include: {
                          users_rel: true,
                          permissions: true
                        }
                    }
                },
                orderBy: {
                    name: 'asc'
                }
            });

            // Map roles to include userCount and permission names
            const mappedRoleTypes = roleTypes.map(rt => ({
              ...rt,
              roles: rt.roles.map(role => ({
                ...role,
                userCount: role.users_rel ? role.users_rel.length : 0,
                permissions: role.permissions ? role.permissions.map(p => p.name) : []
              }))
            }));

            return NextResponse.json(mappedRoleTypes);
        }
    } catch (error) {
        console.error('Error fetching role types:', error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, description } = body;

        // Create a new role type
        const roleType = await prisma.roleType.create({
            data: {
                name,
                description
            }
        });

        return NextResponse.json(roleType, { status: 201 });
    } catch (error: any) {
        if (error.code === 'P2002') {
            return new NextResponse("Role type name must be unique.", { status: 400 });
        }
        console.error('Error creating role type:', error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, name, description } = body;

        // Update an existing role type
        const roleType = await prisma.roleType.update({
            where: { id },
            data: {
                name,
                description
            }
           
        });

        return NextResponse.json(roleType);
    } catch (error) {
        console.error('Error updating role type:', error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const url = new URL(request.url);
        const id = url.searchParams.get('id');

        if (!id) {
            return new NextResponse("Role type ID is required", { status: 400 });
        }

        // Check if the role type is in use
        const rolesUsingType = await prisma.role.count({
            where: { roleTypeId: parseInt(id) }
        });

        if (rolesUsingType > 0) {
            return new NextResponse(
                "Cannot delete role type because it is associated with existing roles. Update or delete those roles first.",
                { status: 400 }
            );
        }

        // Delete the role type
        await prisma.roleType.delete({
            where: { id: parseInt(id) }
        });

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error('Error deleting role type:', error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
