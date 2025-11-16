import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextRequest } from "next/server";

/**
 * Process document embedding asynchronously
 * This runs in the background and doesn't block the upload response
 */
async function processEmbedding(documentId: string, userId: string, fileUrl: string) {
    try {
        const embeddingApiUrl = process.env.EMBEDDING_API_URL || 'http://localhost:8000';

        const embeddingResponse = await fetch(`${embeddingApiUrl}/api/v1/embed/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: userId,
                azure_url: fileUrl,
            }),
        });

        if (!embeddingResponse.ok) {
            await prisma.document.update({
                where: { id: documentId },
                data: {
                    embedStatus: 'failed',
                    updatedAt: new Date(),
                },
            });
            return;
        }

        const embeddingResult = await embeddingResponse.json();

        // Check if embedding was successful
        // The API returns status: "success" when successful
        const isSuccessful = embeddingResult?.status === 'success' || embeddingResult?.status === 'completed';
        
        // If successful, update to 'embed' status
        if (isSuccessful) {
            await prisma.document.update({
                where: { id: documentId },
                data: {
                    embed: true,
                    embedStatus: 'embed',
                    metadata: embeddingResult?.embeddings ? embeddingResult : undefined,
                    updatedAt: new Date(),
                },
            });
        } else {
            // If status is not success/completed, mark as failed
            await prisma.document.update({
                where: { id: documentId },
                data: {
                    embed: false,
                    embedStatus: 'failed',
                    metadata: embeddingResult?.error ? { error: embeddingResult.error } : undefined,
                    updatedAt: new Date(),
                },
            });
        }
    } catch (embeddingError) {
        await prisma.document.update({
            where: { id: documentId },
            data: {
                embed: false,
                embedStatus: 'failed',
                updatedAt: new Date(),
            },
        });
    }
}

export async function POST(request: NextRequest) {
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

        // Parse form data
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const name = formData.get('name') as string;
        const sessionId = formData.get('sessionId') as string | null;

        // Validate required fields
        if (!file) {
            return Response.json(
                {
                    success: false,
                    error: 'File is required',
                    message: 'Please select a file to upload',
                },
                { status: 400 }
            );
        }

        if (!name?.trim()) {
            return Response.json(
                {
                    success: false,
                    error: 'Name is required',
                    message: 'Please provide a name for the document',
                },
                { status: 400 }
            );
        }

        // Validate file type (only PDF and PowerPoint)
        const allowedMimeTypes = [
            'application/pdf',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation'
        ];
        
        if (!allowedMimeTypes.includes(file.type)) {
            return Response.json(
                {
                    success: false,
                    error: 'Invalid file type',
                    message: 'Only PDF and PowerPoint files are allowed',
                },
                { status: 400 }
            );
        }

        // Validate file size (10MB limit)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            return Response.json(
                {
                    success: false,
                    error: 'File too large',
                    message: 'File size must be less than 10MB',
                },
                { status: 400 }
            );
        }

        // Upload to Azure Blob Storage
        const sasUrl = process.env.BlobserviceSASURL;
        const containerName = process.env.DOCUMENT_CONTAINER;

        if (!sasUrl || !containerName) {
            return Response.json(
                {
                    success: false,
                    error: 'Storage configuration missing',
                    message: 'BlobserviceSASURL or DOCUMENT_CONTAINER env vars are not set',
                },
                { status: 500 }
            );
        }

        // Dynamically import to keep edge bundle small if using edge runtime
        const { BlobServiceClient } = await import("@azure/storage-blob");

        const blobServiceClient = new BlobServiceClient(sasUrl);
        const containerClient = blobServiceClient.getContainerClient(containerName);

        const blobName = `${Date.now()}-${file.name}`;
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);

        // Convert file to Buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Upload with correct content-type
        let fileUrl: string;
        try {
            await blockBlobClient.uploadData(buffer, {
                blobHTTPHeaders: {
                    blobContentType: file.type || "application/octet-stream",
                },
            });

            fileUrl = blockBlobClient.url;
        } catch (uploadError: any) {
            // Handle Azure authentication errors specifically
            if (uploadError?.code === 'AuthenticationFailed' || uploadError?.statusCode === 403) {
                const authDetail = uploadError?.details?.authenticationErrorDetail || '';
                
                // Check if it's an expiration issue
                if (authDetail.includes('Signature not valid') || authDetail.includes('Expiry')) {
                    return Response.json(
                        {
                            success: false,
                            error: 'Storage authentication expired',
                            message: 'The Azure storage access token has expired. Please update the BlobserviceSASURL environment variable with a new valid SAS token.',
                            details: authDetail,
                        },
                        { status: 403 }
                    );
                }
                
                return Response.json(
                    {
                        success: false,
                        error: 'Storage authentication failed',
                        message: 'Failed to authenticate with Azure Blob Storage. Please check your BlobserviceSASURL configuration.',
                        details: authDetail || uploadError?.message,
                    },
                    { status: 403 }
                );
            }
            // Re-throw if it's not an authentication error
            throw uploadError;
        }

        // Save document to database with processing status
        const document = await prisma.document.create({
            data: {
                id: crypto.randomUUID(),
                userId,
                sessionId: sessionId?.trim() || null,
                name: name.trim(),
                fileName: file.name,
                fileUrl,
                fileSize: file.size,
                mimeType: file.type || null,
                embed: false,
                embedStatus: 'processing',
                updatedAt: new Date(),
            },
        });

        // Process embedding asynchronously (non-blocking)
        // This runs in the background and doesn't block the response
        processEmbedding(document.id, userId, fileUrl).catch(() => {
            // Silently handle background errors
        });

        // Return success immediately
        return Response.json({
            success: true,
            data: {
                id: document.id,
                name: document.name,
                fileName: document.fileName,
                fileUrl: document.fileUrl,
                fileSize: document.fileSize,
                mimeType: document.mimeType,
                embed: document.embed,
                embedStatus: document.embedStatus,
                createdAt: document.createdAt.toISOString(),
            },
            message: 'Document uploaded successfully',
        });

    } catch (error: any) {
        // Check if it's an Azure authentication error that wasn't caught earlier
        if (error?.code === 'AuthenticationFailed' || error?.statusCode === 403) {
            const authDetail = error?.details?.authenticationErrorDetail || '';
            
            if (authDetail.includes('Signature not valid') || authDetail.includes('Expiry')) {
                return Response.json(
                    {
                        success: false,
                        error: 'Storage authentication expired',
                        message: 'The Azure storage access token has expired. Please update the BlobserviceSASURL environment variable with a new valid SAS token.',
                        details: authDetail,
                    },
                    { status: 403 }
                );
            }
            
            return Response.json(
                {
                    success: false,
                    error: 'Storage authentication failed',
                    message: 'Failed to authenticate with Azure Blob Storage. Please check your BlobserviceSASURL configuration.',
                    details: authDetail || error?.message,
                },
                { status: 403 }
            );
        }
        
        // Generic error handling
        return Response.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred',
                message: 'Failed to upload document',
                ...(error?.code && { code: error.code }),
            },
            { status: 500 }
        );
    }
}
