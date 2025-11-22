import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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

interface DocumentState {
    loading: boolean;
    error: string | null;
    documents: Document[];
}

const initialState: DocumentState = {
    loading: false,
    error: null,
    documents: [],
};

const documentSlice = createSlice({
    name: 'documents',
    initialState,
    reducers: {
        setDocuments: (state, action: PayloadAction<Document[]>) => {
            state.documents = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
    }
});

export const { setDocuments, clearError, setLoading } = documentSlice.actions;
export default documentSlice.reducer;
