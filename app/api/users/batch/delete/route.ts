import { NextResponse } from 'next/server';
import {prisma} from '@/lib/prisma';

// POST to delete multiple users
export async function POST(request: Request) {
    try {
        const data = await request.json();

        // Validate input
        if (!data.userIds || !Array.isArray(data.userIds) || data.userIds.length === 0) {
            return new NextResponse("userIds must be a non-empty array", { status: 400 });
        }

        // Delete all specified users
        const deleteResult = await prisma.user.deleteMany({
            where: {
                id: {
                    in: data.userIds
                }
            }
        });

        return NextResponse.json({
            success: true,
            deletedCount: deleteResult.count
        });
    } catch (error) {
        console.error('Error deleting users:', error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
