# Deepgram Real-Time Transcription Setup

This application uses Deepgram's real-time streaming API with speaker diarization for live audio transcription.

## Features

- ✅ Real-time audio transcription
- ✅ Speaker diarization (identifies different speakers as Speaker 0, Speaker 1, etc.)
- ✅ Live audio level monitoring
- ✅ WebSocket streaming for low latency
- ✅ Console logging for debugging
- ✅ Confidence scores for transcriptions
- ✅ Utterance detection

## Setup Instructions

### 1. Get Your Deepgram API Key

1. Sign up for a free account at [Deepgram Console](https://console.deepgram.com/)
2. Navigate to the API Keys section
3. Create a new API key
4. Copy your API key

### 2. Configure Environment Variables

Create a `.env.local` file in the application directory:

```bash
DEEPGRAM_API_KEY=your_deepgram_api_key_here
```

### 3. Install Dependencies

Make sure you have all required dependencies installed:

```bash
npm install
```

### 4. Run the Application

```bash
npm run dev
```

## How to Use

1. Navigate to a session page: `/session/[session-id]`
2. Click on the "Recording" tab
3. Click "Grant Microphone Access" to allow browser access to your microphone
4. Click "Start Recording" to begin real-time transcription
5. Speak into your microphone - you'll see live transcriptions appear in the "Transcription" tab
6. Multiple speakers will be automatically identified and labeled
7. Click "Stop Recording" when finished

## Console Logging

The application logs detailed information to the browser console:

- 🎤 Microphone access status
- 🔌 Deepgram connection status
- 📩 Raw Deepgram responses
- 📝 Transcription events (interim and final)
- ✅ Final transcription entries added to the UI
- 🗣️ Speech started/ended events
- 📊 Metadata events

Open your browser's developer console (F12) to see real-time logs.

## API Parameters

The integration uses the following Deepgram parameters:

- **encoding**: `linear16` - Audio encoding format
- **sample_rate**: `16000` - 16kHz sample rate
- **channels**: `1` - Mono audio
- **diarize**: `true` - Enable speaker diarization
- **punctuate**: `true` - Add punctuation to transcripts
- **interim_results**: `true` - Show interim transcriptions
- **utterance_end_ms**: `1500` - 1.5s silence before utterance end
- **vad_events**: `true` - Voice activity detection events

## Troubleshooting

### "Deepgram API key not configured" error

Make sure you've created a `.env.local` file with your `DEEPGRAM_API_KEY` and restarted the development server.

### No transcriptions appearing

1. Check the browser console for errors
2. Make sure your microphone is working and not muted
3. Verify the audio level meter is showing activity when you speak
4. Check that you granted microphone permissions to the browser

### Connection errors

1. Verify your Deepgram API key is valid
2. Check your internet connection
3. Look for CORS errors in the browser console

### Audio quality issues

1. Use a good quality microphone
2. Reduce background noise
3. Speak clearly and at a normal volume
4. Ensure proper microphone permissions are granted

## Technical Details

### Architecture

1. **Frontend**: React component (`audio-recorder.tsx`)
2. **API Route**: Next.js API route (`/api/deepgram/token/route.ts`)
3. **WebSocket**: Direct connection to Deepgram's streaming API
4. **MediaRecorder**: Browser API for capturing audio

### Audio Processing

1. Browser requests microphone access
2. MediaRecorder captures audio in WebM format
3. Audio chunks are sent to Deepgram via WebSocket every 250ms
4. Deepgram processes audio and returns transcriptions with speaker labels
5. Final transcriptions are displayed in the UI with speaker identification

### Speaker Diarization

Deepgram automatically identifies different speakers and assigns them numerical labels (0, 1, 2, etc.). Each transcription entry includes:

- **speaker**: The speaker ID number
- **text**: The transcribed text
- **timestamp**: When the transcription occurred
- **confidence**: Confidence score (0-1)

## Resources

- [Deepgram Documentation](https://developers.deepgram.com/)
- [Speaker Diarization Guide](https://developers.deepgram.com/docs/diarization)
- [Streaming API Reference](https://developers.deepgram.com/docs/streaming)

