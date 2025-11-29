import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface RedFlag {
    id: string;
    caseId: string;
    type: "inconsistency" | "concern" | "critical";
    title: string;
    description: string;
    source?: string;
    timestamp: number;
    isNew?: boolean;
}

interface RedFlagsState {
    loading: boolean;
    error: string | null;
    flags: RedFlag[];
    unreadCount: number;
    currentCaseId: string | null;
}

const initialState: RedFlagsState = {
    loading: false,
    error: null,
    flags: [],
    unreadCount: 0,
    currentCaseId: null,
};

const redFlagsSlice = createSlice({
    name: 'redFlags',
    initialState,
    reducers: {
        setRedFlags: (state, action: PayloadAction<{ caseId: string; flags: RedFlag[] }>) => {
            state.flags = action.payload.flags;
            state.currentCaseId = action.payload.caseId;
            state.unreadCount = action.payload.flags.filter(f => f.isNew).length;
        },
        addRedFlag: (state, action: PayloadAction<RedFlag>) => {
            state.flags.push({ ...action.payload, isNew: true });
            state.unreadCount += 1;
        },
        markRedFlagAsRead: (state, action: PayloadAction<string>) => {
            const flag = state.flags.find(f => f.id === action.payload);
            if (flag && flag.isNew) {
                flag.isNew = false;
                state.unreadCount = Math.max(0, state.unreadCount - 1);
            }
        },
        markAllRedFlagsAsRead: (state) => {
            state.flags.forEach(flag => {
                flag.isNew = false;
            });
            state.unreadCount = 0;
        },
        clearRedFlags: (state) => {
            state.flags = [];
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
    setRedFlags,
    addRedFlag,
    markRedFlagAsRead,
    markAllRedFlagsAsRead,
    clearRedFlags,
    clearError,
    setLoading,
    setError
} = redFlagsSlice.actions;

export default redFlagsSlice.reducer;
