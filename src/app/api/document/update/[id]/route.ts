import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextRequest } from "next/server";

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
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
        const { id } = await params;
        const body = await request.json();
        const { sessionId } = body;

        // Validate document ID
        if (!id) {
            return Response.json(
                {
                    success: false,
                    error: 'Document ID is required',
                    message: 'Please provide a document ID',
                },
                { status: 400 }
            );
        }

        // Validate sessionId
        if (!sessionId) {
            return Response.json(
                {
                    success: false,
                    error: 'Session ID is required',
                    message: 'Please provide a session ID',
                },
                { status: 400 }
            );
        }

        // Check if document exists and belongs to user
        const existingDocument = await prisma.document.findFirst({
            where: {
                id,
                userId,
            },
        });

        if (!existingDocument) {
            return Response.json(
                {
                    success: false,
                    error: 'Document not found',
                    message: 'Document not found or you do not have permission to update it',
                },
                { status: 404 }
            );
        }

        // Check if the session exists and belongs to user
        const sessionExists = await prisma.appSession.findFirst({
            where: {
                id: sessionId,
                userId,
            },
        });

        if (!sessionExists) {
            return Response.json(
                {
                    success: false,
                    error: 'Session not found',
                    message: 'Session not found or you do not have permission to assign to it',
                },
                { status: 404 }
            );
        }

        // Update document
        const updatedDocument = await prisma.document.update({
            where: {
                id,
            },
            data: {
                sessionId,
                updatedAt: new Date(),
            },
        });

        return Response.json({
            success: true,
            data: {
                id: updatedDocument.id,
                name: updatedDocument.name,
                sessionId: updatedDocument.sessionId,
                updatedAt: updatedDocument.updatedAt.toISOString(),
            },
            message: 'Document updated successfully',
        });

    } catch (error) {
        console.error('Error updating document:', error);
        return Response.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred',
                message: 'Failed to update document',
            },
            { status: 500 }
        );
    }
}
