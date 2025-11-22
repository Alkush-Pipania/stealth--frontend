import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Case interface matching backend schema
export interface Case {
  id: string;
  title: string;
  description: string | null;
  ownerId: string;
  jurisdiction: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface CasesState {
  loading: boolean;
  error: string | null;
  cases: Case[];
}

const initialState: CasesState = {
  loading: false,
  error: null,
  cases: [],
};

const casesSlice = createSlice({
  name: 'cases',
  initialState,
  reducers: {
    setCases: (state, action: PayloadAction<Case[]>) => {
      state.cases = action.payload;
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
  },
});

export const { setCases, clearError, setLoading, setError } = casesSlice.actions;
export default casesSlice.reducer;
