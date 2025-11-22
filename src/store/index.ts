import { configureStore } from '@reduxjs/toolkit';
import AppSessionslice from './slice/sessionslice';
import documentSlice from './slice/documentslice';
import casesSlice from './slice/casesslice';

export const store = configureStore({
    reducer: {
        AppSessions: AppSessionslice,
        documents: documentSlice,
        cases: casesSlice,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;