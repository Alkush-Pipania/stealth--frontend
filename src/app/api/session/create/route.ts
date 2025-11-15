import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { generateId } from "@/lib/utils";

export async function POST(request: Request) {
    try {
        // Check authentication
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session || !session.user.id) {
            return Response.json({
                success: false,
                error: 'Unauthorized',
                message: 'User not authenticated'
            }, { status: 401 });
        }

        const userId = session.user.id;
        const body = await request.json();

        // Validate required fields
        const { name, description } = body;

        if (!name || !name.trim()) {
            return Response.json({
                success: false,
                error: 'Name is required',
                message: 'Please provide a name for the session'
            }, { status: 400 });
        }

        // Create new app session
        const appSession = await prisma.appSession.create({
            data: {
                id: generateId(),
                name: name.trim(),
                description: description?.trim() || null,
                userId,
                isActive: true,
                updatedAt: new Date()
            },
            select: {
                id: true,
                name: true,
                description: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
                Document: {
                    select: {
                        id: true,
                        name: true,
                        fileName: true,
                        fileUrl: true
                    }
                }
            }
        });

        return Response.json({
            success: true,
            data: appSession,
            message: 'Session created successfully'
        });

    } catch (error) {
        console.error('Error creating session:', error);
        return Response.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred',
            message: 'Failed to create session'
        }, { status: 500 });
    }
}
