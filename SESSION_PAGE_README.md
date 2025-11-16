# Session Page with Deepgram Diarization

This document describes the implementation of the session page with real-time audio recording and speaker diarization using Deepgram.

## Features

- **Real-time Audio Recording**: Capture audio directly from user's microphone
- **Speaker Diarization**: Automatically identify and separate different speakers
- **Live Transcription**: Real-time speech-to-text with speaker attribution
- **Audio Level Visualization**: Visual feedback of microphone input levels
- **Transcription Export**: Download or copy transcriptions to clipboard
- **Session Management**: View session details and associated documents

## Architecture

### Pages

- **`/session/[id]`** - Session detail page (Server Component)
  - Handles authentication
  - Fetches session data from database
  - Passes data to client component

### Components

1. **SessionPageClient** (`src/components/session/session-page-client.tsx`)
   - Main client component for the session page
   - Manages transcription state
   - Provides tabbed interface for Recording, Transcription, and Documents

2. **AudioRecorder** (`src/components/session/audio-recorder.tsx`)
   - Handles microphone permission requests
   - Manages MediaRecorder and WebSocket connections
   - Sends audio data to Deepgram
   - Displays audio level visualization

3. **TranscriptionDisplay** (`src/components/session/transcription-display.tsx`)
   - Displays transcriptions with speaker colors
   - Shows confidence scores and timestamps
   - Provides export functionality (copy/download)
   - Displays statistics (total segments, speakers, avg confidence)

### API Routes

**`/api/deepgram/stream`** (GET)
- Creates temporary Deepgram API keys for browser clients
- Keys expire after 1 hour
- Scoped to `usage:write` only

## Setup Instructions

### 1. Install Dependencies

Dependencies are already installed via `npm install` which includes:
- `@deepgram/sdk` - Deepgram SDK for Node.js

### 2. Configure Environment Variables

Add your Deepgram API key to `.env` (see `.env.example`):

```env
DEEPGRAM_API_KEY="your-deepgram-api-key-here"
```

To get a Deepgram API key:
1. Sign up at https://console.deepgram.com/
2. Create a new project
3. Generate an API key with appropriate permissions

### 3. Access the Session Page

Navigate to `/session/[session-id]` where `[session-id]` is a valid session ID from your database.

## Usage Flow

1. **Access Session Page**
   - User navigates to a session via dashboard
   - Session details are loaded from database

2. **Grant Microphone Permission**
   - Click "Grant Microphone Access" button
   - Browser prompts for microphone permission
   - Audio level visualization appears

3. **Start Recording**
   - Click "Start Recording" button
   - Component fetches temporary Deepgram API key
   - WebSocket connection established to Deepgram
   - Audio streaming begins

4. **View Transcriptions**
   - Real-time transcriptions appear in the Transcription tab
   - Each speaker is assigned a unique color and number
   - Confidence scores are displayed for each segment

5. **Stop Recording**
   - Click "Stop Recording" button
   - WebSocket connection closes
   - All transcriptions remain available for export

6. **Export Transcriptions**
   - Copy to clipboard or download as text file
   - Format: `[timestamp] Speaker X: transcription text`

## Deepgram Configuration

The implementation uses the following Deepgram settings:

```javascript
{
  model: "nova-2",              // Latest Deepgram model
  language: "en",                // English language
  smart_format: true,            // Automatic formatting
  diarize: true,                 // Enable speaker diarization
  punctuate: true,               // Add punctuation
  interim_results: false,        // Only final results
  utterance_end_ms: 1000        // 1 second utterance end detection
}
```

### Diarization Details

- **Speaker Detection**: Deepgram automatically detects different speakers
- **Speaker Labeling**: Speakers are numbered (0, 1, 2, etc.)
- **Accuracy**: Depends on audio quality and speaker distinctiveness
- **Best Practices**:
  - Use good quality microphone
  - Minimize background noise
  - Ensure speakers have distinct voices

## File Structure

```
src/
├── app/
│   ├── (main)/
│   │   └── session/
│   │       └── [id]/
│   │           └── page.tsx                  # Session detail page
│   └── api/
│       └── deepgram/
│           └── stream/
│               └── route.ts                  # Temporary key endpoint
├── components/
│   ├── session/
│   │   ├── session-page-client.tsx          # Main client component
│   │   ├── audio-recorder.tsx               # Recording component
│   │   └── transcription-display.tsx        # Transcription display
│   └── ui/
│       ├── tabs.tsx                          # Tabs UI component
│       ├── scroll-area.tsx                   # Scroll area component
│       └── alert.tsx                         # Alert component
```

## Security Considerations

1. **Temporary Keys**: API keys are temporary (1 hour expiration)
2. **Scoped Permissions**: Keys are scoped to `usage:write` only
3. **Authentication**: Session page requires user authentication
4. **Authorization**: Users can only access their own sessions

## Browser Compatibility

Requires browsers that support:
- WebRTC (MediaRecorder API)
- WebSocket
- getUserMedia API

Tested on:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Troubleshooting

### Microphone Permission Denied
- Check browser settings for microphone access
- Ensure HTTPS or localhost (required for getUserMedia)

### WebSocket Connection Failed
- Verify DEEPGRAM_API_KEY is set correctly
- Check Deepgram account has sufficient credits
- Ensure network allows WebSocket connections

### No Speaker Diarization
- Ensure `diarize: true` in Deepgram config
- Check audio quality and speaker distinctiveness
- Diarization works best with 2-4 speakers

### Poor Transcription Quality
- Improve microphone quality
- Reduce background noise
- Speak clearly and at moderate pace

## Future Enhancements

- [ ] Save transcriptions to database
- [ ] Support multiple audio sources (meeting audio + mic)
- [ ] Real-time translation
- [ ] Speaker identification (assign names to speaker IDs)
- [ ] Audio playback with synchronized transcription
- [ ] Custom vocabulary and domain-specific models
- [ ] Sentiment analysis
- [ ] Action item extraction

## Resources

- [Deepgram Documentation](https://developers.deepgram.com/)
- [Deepgram Diarization Guide](https://developers.deepgram.com/docs/diarization)
- [Next.js Documentation](https://nextjs.org/docs)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
