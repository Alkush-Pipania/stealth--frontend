import { createSlice, PayloadAction } from "@reduxjs/toolkit";

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
    }
});

// Export actions
export const { setCurrentFolder, clearError, setLoading } = AppSessionslice.actions;

// Export reducer
export default AppSessionslice.reducer;