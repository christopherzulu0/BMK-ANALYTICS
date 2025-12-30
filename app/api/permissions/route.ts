import {prisma} from '@/lib/prisma';
import { NextResponse } from 'next/server';


export async function GET() {
    try {


        // Get all permissions
        const permissions = await prisma.permission.findMany({
            orderBy: {
                name: 'asc'
            }
        })

        // Group permissions by their prefix (e.g., "dashboard.view" -> "dashboard")
        const groupedPermissions = permissions.reduce((acc, permission) => {
            const group = permission.name.split('.')[0]
            if (!acc[group]) {
                acc[group] = []
            }
            acc[group].push({
                id: permission.id,
                name: permission.name,
                description: permission.description
            })
            return acc
        }, {} as Record<string, Array<{ id: number; name: string; description: string | null }>>)

        return NextResponse.json(groupedPermissions)
    } catch (error) {
        console.error('Error fetching permissions:', error)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}
