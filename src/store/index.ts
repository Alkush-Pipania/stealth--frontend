import { configureStore } from '@reduxjs/toolkit';
import AppSessionslice from './slice/sessionslice';
import documentSlice from './slice/documentslice';
import casesSlice from './slice/casesslice';
import questionsSlice from './slice/questionsslice';
import redFlagsSlice from './slice/redflagsslice';
import followUpsSlice from './slice/followupsslice';

export const store = configureStore({
    reducer: {
        AppSessions: AppSessionslice,
        documents: documentSlice,
        cases: casesSlice,
        questions: questionsSlice,
        redFlags: redFlagsSlice,
        followUps: followUpsSlice,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;