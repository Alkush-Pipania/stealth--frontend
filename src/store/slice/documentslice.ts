import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Document interface matching backend response
export interface Document {
    id: string;
    filename: string;
    contentType: string | null;
    pages: number | null;
    status: string;
    uploadedAt: string;
}

interface DocumentState {
    loading: boolean;
    error: string | null;
    documents: Document[];
    currentCaseId: string | null;
}

const initialState: DocumentState = {
    loading: false,
    error: null,
    documents: [],
    currentCaseId: null,
};

const documentSlice = createSlice({
    name: 'documents',
    initialState,
    reducers: {
        setDocuments: (state, action: PayloadAction<{ caseId: string; documents: Document[] }>) => {
            state.documents = action.payload.documents;
            state.currentCaseId = action.payload.caseId;
        },
        clearDocuments: (state) => {
            state.documents = [];
            state.currentCaseId = null;
        },
        clearError: (state) => {
            state.error = null;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setError: (state, action: PayloadAction<string>) => {
            state.error = action.payload;
        },
    }
});

export const { setDocuments, clearDocuments, clearError, setLoading, setError } = documentSlice.actions;
export default documentSlice.reducer;
