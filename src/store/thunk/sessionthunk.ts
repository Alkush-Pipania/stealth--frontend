import { createAsyncThunk } from '@reduxjs/toolkit';
import { apiGet, apiPost } from '@/server/serverAction';
import { API_ENDPOINTS } from '@/server/endpoint';

// Types for the session data
interface Document {
    id: string;
    name: string;
    fileName: string;
    fileUrl: string | null;
    fileSize: number | null;
    mimeType: string | null;
    embed: boolean;
    embedStatus: string | null;
    createdAt: string;
}

interface AppSession {
    id: string;
    name: string;
    description: string | null;
    createdAt: string;
    updatedAt: string;
    isActive: boolean;
    Document: Document[];
}

interface GetAppSessionsResponse {
    success: boolean;
    data: AppSession[];
    message?: string;
    error?: string;
}

/**
 * Async thunk to fetch all app sessions
 */
export const fetchAppSessions = createAsyncThunk<
    AppSession[],
    void,
    {
        rejectValue: string;
    }
>(
    'appSessions/fetchAppSessions',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiGet<GetAppSessionsResponse>(API_ENDPOINTS.GET_APPSESSIONS);

            if (!response.success || !response.data) {
                return rejectWithValue(response.error || 'Failed to fetch app sessions');
            }

            // apiGet wraps the response, so response.data contains the API response
            // We need to access response.data.data to get the actual sessions array
            return response.data.data || [];
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return rejectWithValue(errorMessage);
        }
    }
);

/**
 * Async thunk to fetch a specific app session by ID
 */
export const fetchAppSessionById = createAsyncThunk<
    AppSession,
    string,
    {
        rejectValue: string;
    }
>(
    'appSessions/fetchAppSessionById',
    async (sessionId, { rejectWithValue }) => {
        try {
            const response = await apiGet<{ success: boolean; data: AppSession; message?: string; error?: string; }>(
                `${API_ENDPOINTS.GET_APPSESSIONS}/${sessionId}`
            );

            if (!response.success || !response.data) {
                return rejectWithValue(response.error || 'Failed to fetch app session');
            }

            // apiGet wraps the response, so we need to access response.data.data
            if (!response.data.data) {
                return rejectWithValue('App session not found');
            }

            return response.data.data;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return rejectWithValue(errorMessage);
        }
    }
);

/**
 * Async thunk to refresh app sessions (same as fetch but can be used for refresh scenarios)
 */
export const refreshAppSessions = createAsyncThunk<
    AppSession[],
    void,
    {
        rejectValue: string;
    }
>(
    'appSessions/refreshAppSessions',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiGet<GetAppSessionsResponse>(API_ENDPOINTS.GET_APPSESSIONS);

            if (!response.success || !response.data) {
                return rejectWithValue(response.error || 'Failed to refresh app sessions');
            }

            // apiGet wraps the response, so response.data contains the API response
            return response.data.data || [];
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return rejectWithValue(errorMessage);
        }
    }
);

/**
 * Async thunk to create a new app session
 */
export const createAppSession = createAsyncThunk<
    AppSession,
    { name: string; description?: string },
    {
        rejectValue: string;
    }
>(
    'appSessions/createAppSession',
    async (sessionData, { rejectWithValue }) => {
        try {
            const response = await apiPost<{ success: boolean; data: AppSession; message?: string; error?: string; }>(
                API_ENDPOINTS.CREATE_SESSION,
                { body: sessionData }
            );

            if (!response.success || !response.data) {
                return rejectWithValue(response.error || 'Failed to create app session');
            }

            // apiPost wraps the response, so we need to access response.data.data
            if (!response.data.data) {
                return rejectWithValue('App session creation failed');
            }

            return response.data.data;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return rejectWithValue(errorMessage);
        }
    }
);