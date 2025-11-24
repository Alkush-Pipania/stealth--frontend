import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Question interface matching backend schema
export interface Question {
    id: string;
    caseId: string;
    authorId: string | null;
    text: string;
    priority: number;
    rationale: string | null;
    linkedChunkIds: string[];
    documentId: string | null;
    pageNumber: number | null;
    followups: any | null;
    createdAt: string;
    updatedAt: string;
}

interface QuestionState {
    loading: boolean;
    error: string | null;
    questions: Question[];
    currentCaseId: string | null;
}

const initialState: QuestionState = {
    loading: false,
    error: null,
    questions: [],
    currentCaseId: null,
};

const questionSlice = createSlice({
    name: 'questions',
    initialState,
    reducers: {
        setQuestions: (state, action: PayloadAction<{ caseId: string; questions: Question[] }>) => {
            state.questions = action.payload.questions;
            state.currentCaseId = action.payload.caseId;
        },
        clearQuestions: (state) => {
            state.questions = [];
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

export const { setQuestions, clearQuestions, clearError, setLoading, setError } = questionSlice.actions;
export default questionSlice.reducer;
