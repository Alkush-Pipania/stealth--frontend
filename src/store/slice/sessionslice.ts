import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { fetchAppSessions, fetchAppSessionById, refreshAppSessions, createAppSession } from '../thunk/sessionthunk';

interface Document{
    id: string,
    name: string,
    fileName: string,
    fileUrl: string | null,
    fileSize: number | null,
    mimeType: string | null,
    embed: boolean,
    embedStatus: string | null,
    createdAt: string
}

interface AppSession{
    id: string,
    name: string,
    description: string | null,
    createdAt: string,
    updatedAt: string,
    isActive: boolean,
    Document: Document[]
}

interface session{
    loading : boolean,
    error : string | null,
    AppSessions : AppSession[]
}

const initialState : session = {
    loading : false,
    error : null,
    AppSessions : []
}

const AppSessionslice = createSlice({
    name: 'AppSessions',
    initialState,
    reducers: {
        setCurrentFolder: (state, action: PayloadAction<AppSession[] | null>) => {
            state.AppSessions = action.payload || [];
        },
        clearError: (state) => {
            state.error = null;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        }
    },
    extraReducers: (builder) => {
        // Fetch App Sessions
        builder
            .addCase(fetchAppSessions.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAppSessions.fulfilled, (state, action) => {
                state.loading = false;
                state.AppSessions = action.payload;
                state.error = null;
            })
            .addCase(fetchAppSessions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to fetch app sessions';
            })
            // Fetch App Session by ID
            .addCase(fetchAppSessionById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAppSessionById.fulfilled, (state, action) => {
                state.loading = false;
                // Update the specific session in the array or add it if it doesn't exist
                const index = state.AppSessions.findIndex(session => session.id === action.payload.id);
                if (index !== -1) {
                    state.AppSessions[index] = action.payload;
                } else {
                    state.AppSessions.push(action.payload);
                }
                state.error = null;
            })
            .addCase(fetchAppSessionById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to fetch app session';
            })
            // Refresh App Sessions
            .addCase(refreshAppSessions.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(refreshAppSessions.fulfilled, (state, action) => {
                state.loading = false;
                state.AppSessions = action.payload;
                state.error = null;
            })
            .addCase(refreshAppSessions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to refresh app sessions';
            })
            // Create App Session
            .addCase(createAppSession.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createAppSession.fulfilled, (state, action) => {
                state.loading = false;
                // Add the new session to the beginning of the array
                state.AppSessions.unshift(action.payload);
                state.error = null;
            })
            .addCase(createAppSession.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to create app session';
            });
    }
});

// Export actions
export const { setCurrentFolder, clearError, setLoading } = AppSessionslice.actions;

// Export reducer
export default AppSessionslice.reducer;