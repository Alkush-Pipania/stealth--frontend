import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";



export async function GET(request : Request){
    const session = await auth.api.getSession({
        headers: await headers()
    });
    if(!session || !session.user.id){
        return Response.json({
            success: false,
            error: 'Unauthorized',
            message: 'User not authenticated'
        }, { status: 401 });
    }
    const userId = session.user.id;
    
    try{
        // Get all sessions for the user, ordered by creation date
        const appsessions = await prisma.appSession.findMany({
            where: {
                userId
            },
            select: {
                id: true,
                name: true,
                description: true,
                createdAt: true,
                updatedAt: true,
                isActive: true,
                Document: {
                    select: {
                        id: true,
                        name: true,
                        fileName: true,
                        fileUrl: true,
                        fileSize: true,
                        mimeType: true,
                        embed: true,
                        embedStatus: true,
                        createdAt: true
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return Response.json({
            success: true,
            data: appsessions,
            message: 'App sessions retrieved successfully'
        });
    } catch(error) {
        console.error('Error fetching app sessions:', error);
        return Response.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred',
                message: 'Failed to fetch app sessions'
            },
            { status: 500 }
        );
    }
}