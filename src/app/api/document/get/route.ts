import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET(request: Request) {
    try {
        // Check authentication
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session || !session.user.id) {
            return Response.json(
                {
                    success: false,
                    error: 'Unauthorized',
                    message: 'User not authenticated',
                },
                { status: 401 }
            );
        }

        const userId = session.user.id;

        // Get sessionId from query params if provided
        const url = new URL(request.url);
        const sessionId = url.searchParams.get('sessionId');

        // Build where clause
        const whereClause: any = {
            userId,
        };

        // Filter by sessionId if provided
        if (sessionId) {
            whereClause.sessionId = sessionId;
        }

        // Fetch documents from database
        const documents = await prisma.document.findMany({
            where: whereClause,
            orderBy: {
                createdAt: 'desc',
            },
            select: {
                id: true,
                name: true,
                fileName: true,
                filePath: true,
                fileUrl: true,
                fileSize: true,
                mimeType: true,
                pageCount: true,
                embed: true,
                embedStatus: true,
                metadata: true,
                sessionId: true,
                createdAt: true,
                updatedAt: true,
                userId: true,
            },
        });

        return Response.json({
            success: true,
            data: documents,
            message: 'Documents retrieved successfully',
        });

    } catch (error) {
        console.error('Error fetching documents:', error);
        return Response.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred',
                message: 'Failed to fetch documents',
            },
            { status: 500 }
        );
    }
}
