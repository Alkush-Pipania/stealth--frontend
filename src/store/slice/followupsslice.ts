import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface FollowUpQuestion {
    id: string;
    questionId: string;
    text: string;
    context?: string;
    priority: number;
    status: "pending" | "addressed" | "dismissed";
    timestamp: number;
    isNew?: boolean;
}

interface FollowUpsState {
    loading: boolean;
    error: string | null;
    questions: FollowUpQuestion[];
    unreadCount: number;
    currentCaseId: string | null;
}

const initialState: FollowUpsState = {
    loading: false,
    error: null,
    questions: [],
    unreadCount: 0,
    currentCaseId: null,
};

const followUpsSlice = createSlice({
    name: 'followUps',
    initialState,
    reducers: {
        setFollowUps: (state, action: PayloadAction<{ caseId: string; questions: FollowUpQuestion[] }>) => {
            state.questions = action.payload.questions;
            state.currentCaseId = action.payload.caseId;
            state.unreadCount = action.payload.questions.filter(q => q.isNew).length;
        },
        addFollowUp: (state, action: PayloadAction<FollowUpQuestion>) => {
            state.questions.push({ ...action.payload, isNew: true });
            state.unreadCount += 1;
        },
        updateFollowUpStatus: (state, action: PayloadAction<{ id: string; status: "pending" | "addressed" | "dismissed" }>) => {
            const question = state.questions.find(q => q.id === action.payload.id);
            if (question) {
                question.status = action.payload.status;
            }
        },
        markFollowUpAsRead: (state, action: PayloadAction<string>) => {
            const question = state.questions.find(q => q.id === action.payload);
            if (question && question.isNew) {
                question.isNew = false;
                state.unreadCount = Math.max(0, state.unreadCount - 1);
            }
        },
        markAllFollowUpsAsRead: (state) => {
            state.questions.forEach(question => {
                question.isNew = false;
            });
            state.unreadCount = 0;
        },
        clearFollowUps: (state) => {
            state.questions = [];
            state.unreadCount = 0;
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

export const {
    setFollowUps,
    addFollowUp,
    updateFollowUpStatus,
    markFollowUpAsRead,
    markAllFollowUpsAsRead,
    clearFollowUps,
    clearError,
    setLoading,
    setError
} = followUpsSlice.actions;

export default followUpsSlice.reducer;
