import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { SessionState, TranscriptMessage } from "@/types/session";

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

interface LiveKitSession {
    sessionId: string | null
    roomName: string | null
    livekitUrl: string | null
    token: string | null
    status: SessionState
    error: string | null
}

interface session{
    loading : boolean,
    error : string | null,
    AppSessions : AppSession[]
    // LiveKit session state
    liveSession: LiveKitSession
    transcripts: TranscriptMessage[]
}

const initialState : session = {
    loading : false,
    error : null,
    AppSessions : [],
    liveSession: {
        sessionId: null,
        roomName: null,
        livekitUrl: null,
        token: null,
        status: 'idle',
        error: null,
    },
    transcripts: []
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
        },
        // LiveKit session reducers
        setLiveSessionData: (state, action: PayloadAction<{
            sessionId: string
            roomName: string
            livekitUrl: string
            token: string
        }>) => {
            state.liveSession = {
                ...action.payload,
                status: 'connected',
                error: null,
            };
        },
        setLiveSessionStatus: (state, action: PayloadAction<SessionState>) => {
            state.liveSession.status = action.payload;
        },
        setLiveSessionError: (state, action: PayloadAction<string>) => {
            state.liveSession.error = action.payload;
            state.liveSession.status = 'error';
        },
        clearLiveSession: (state) => {
            state.liveSession = {
                sessionId: null,
                roomName: null,
                livekitUrl: null,
                token: null,
                status: 'idle',
                error: null,
            };
            state.transcripts = [];
        },
        addTranscript: (state, action: PayloadAction<TranscriptMessage>) => {
            state.transcripts.push(action.payload);
        },
        clearTranscripts: (state) => {
            state.transcripts = [];
        }
    }
});

// Export actions
export const {
    setCurrentFolder,
    clearError,
    setLoading,
    setLiveSessionData,
    setLiveSessionStatus,
    setLiveSessionError,
    clearLiveSession,
    addTranscript,
    clearTranscripts
} = AppSessionslice.actions;

// Export reducer
export default AppSessionslice.reducer;