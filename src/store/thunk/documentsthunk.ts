import { createAsyncThunk } from '@reduxjs/toolkit';
import { apiGet } from '@/server/serverAction';
import { API_ENDPOINTS } from '@/server/endpoint';

// Document interface matching the Prisma schema
export interface Document {
    id: string;
    name: string;
    fileName: string;
    filePath: string | null;
    fileUrl: string | null;
    fileSize: number | null;
    mimeType: string | null;
    pageCount: number | null;
    embed: boolean;
    embedStatus: string | null;
    metadata: any | null;
    sessionId: string | null;
    createdAt: string;
    updatedAt: string;
    userId: string;
}

interface GetDocumentsResponse {
    success: boolean;
    data: Document[];
    message?: string;
    error?: string;
}

/**
 * Async thunk to fetch all documents for the current user
 */
export const fetchDocuments = createAsyncThunk<
    Document[],
    void,
    { rejectValue: string }
>(
    'documents/fetchDocuments',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiGet<GetDocumentsResponse>(API_ENDPOINTS.GET_DOCUMENTS);

            if (!response.success || !response.data) {
                return rejectWithValue(response.error || 'Failed to fetch documents');
            }

            // apiGet wraps the response, so response.data contains the API response
            // We need to access response.data.data to get the actual documents array
            return response.data.data || [];
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error occurred';
            return rejectWithValue(message);
        }
    },
);
