# Deepgram WebSocket Authentication Fix

## What Was Fixed

### 1. Authentication Method Change
**Problem**: The previous implementation used WebSocket subprotocol authentication `['token', apiKey]`, which can be unreliable in browsers and was causing error code 1006.

**Solution**: Changed to passing the API key as a URL query parameter, which is more reliable:
```javascript
// OLD (unreliable in browsers)
const socket = new WebSocket(url, ["token", deepgramApiKey]);

// NEW (browser-compatible)
const url = `wss://api.deepgram.com/v1/listen?${params}&token=${apiKey}`;
const socket = new WebSocket(url);
```

### 2. Live Transcription with Interim Results
**Added**: `interim_results: true` for real-time transcription feedback
- Interim results appear instantly as you speak (logged to console)
- Final results are saved to UI with speaker diarization
- `speech_final` event used for more reliable utterance detection

### 3. Enhanced Error Handling
- Better diagnostic logging for authentication failures
- API key validation and trimming in `/api/deepgram/token` route
- Detailed WebSocket close code explanations
- More helpful error messages

### 4. Additional Improvements
- Added `smart_format: true` for better punctuation and formatting
- Improved console logging with less verbosity for results
- Better speaker detection from word-level diarization data
- API key whitespace trimming to prevent common errors

## Setup Instructions

### Step 1: Get Your Deepgram API Key

1. Go to [Deepgram Console](https://console.deepgram.com/)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key (it should be a long string like `abcd1234efgh5678...`)

### Step 2: Configure Environment Variable

Create or edit `.env.local` in the project root:

```bash
DEEPGRAM_API_KEY=your_actual_api_key_here
```

**Important**:
- Do NOT add quotes around the key
- Do NOT add spaces or newlines
- Make sure there's no extra whitespace

Example:
```bash
# WRONG
DEEPGRAM_API_KEY="abc123..."
DEEPGRAM_API_KEY= abc123...

# CORRECT
DEEPGRAM_API_KEY=abc123...
```

### Step 3: Restart Development Server

```bash
# Stop the server (Ctrl+C if running)
# Then restart:
npm run dev
```

**IMPORTANT**: You MUST restart the server after adding/changing `.env.local`

### Step 4: Test the API Endpoint

While the dev server is running, open in your browser:
```
http://localhost:3000/api/deepgram/token
```

You should see:
```json
{"key":"your_api_key_here"}
```

If you see an error, check the server console logs for details.

### Step 5: Test Real-Time Transcription

1. Navigate to a session page: `/session/[session-id]`
2. Click on the "Recording" tab
3. Open browser console (F12) to see detailed logs
4. Click "Grant Microphone Access"
5. Click "Start Recording"
6. Look for these console messages:
   ```
   ✅ Deepgram API key loaded
   🔑 API Key loaded: abc123...
   🌐 Connecting to Deepgram WebSocket...
   🔌 Connected to Deepgram
   ```
7. Speak into your microphone
8. Watch the console for transcription events

## Troubleshooting

### Error 1006: Authentication Failed

**Symptoms**:
```
❌ Deepgram WebSocket error
Close code: 1006
```

**Solutions**:
1. Verify your API key is valid at https://console.deepgram.com/
2. Check that `.env.local` has the correct key with no extra spaces
3. Test `/api/deepgram/token` endpoint
4. Restart the development server
5. Check the API key is active and not expired
6. Verify you haven't exceeded your Deepgram quota

### No Transcriptions Appearing

**Check**:
1. Browser console for errors
2. Microphone permissions granted
3. Audio level meter showing activity
4. Connection status shows "Connected"
5. Speak clearly and loudly enough

**Console logs to look for**:
```
💬 Interim: [your speech]  <- Interim results (not saved)
✅ Adding final transcription: {...}  <- Final results (saved to UI)
```

### API Key Not Found

**Error**:
```
❌ DEEPGRAM_API_KEY not found in environment variables
```

**Solutions**:
1. Create `.env.local` file in project root (not in subdirectories)
2. Add `DEEPGRAM_API_KEY=your_key` to the file
3. Restart the development server
4. Verify with `/api/deepgram/token` endpoint

### Connection Immediately Closes

**Check**:
1. Network/firewall not blocking WebSocket connections
2. Antivirus not blocking wss:// connections
3. Try different browser
4. Check browser console for CORS errors

## Features Now Working

✅ Real-time WebSocket connection to Deepgram
✅ Live speaker diarization (Speaker 0, Speaker 1, etc.)
✅ Interim results for instant feedback
✅ Final results with speaker identification
✅ Audio level monitoring
✅ Voice activity detection
✅ Smart formatting with punctuation
✅ Utterance detection
✅ Confidence scores
✅ Error handling and detailed logging

## Console Log Guide

When everything is working, you'll see:

```
✅ Deepgram API key loaded
🔑 API Key loaded: abc123...
🎤 Microphone access granted
🌐 Connecting to Deepgram WebSocket...
🔌 Connected to Deepgram
📊 Deepgram Metadata: {...}
🗣️ Speech started
💬 Interim: Hello world...  (live as you speak)
📝 Transcription: {...}
✅ Adding final transcription: {...}  (saved to UI with speaker)
🔚 Utterance ended
```

## Production Considerations

⚠️ **Security Warning**: The current implementation sends the API key to the client browser.

**For production**, you should:
1. Use Deepgram's temporary key generation API
2. Create keys with limited scope and expiration
3. Use a server-side proxy for WebSocket connections
4. Implement rate limiting
5. Monitor usage and costs

See: https://developers.deepgram.com/docs/authenticating#temporary-token-creation

## Additional Resources

- [Deepgram Console](https://console.deepgram.com/)
- [Deepgram Streaming API Docs](https://developers.deepgram.com/docs/getting-started-with-live-streaming-audio)
- [Speaker Diarization Guide](https://developers.deepgram.com/docs/diarization)
- [Browser WebSocket Guide](https://deepgram.com/learn/live-transcription-mic-browser)

## Technical Details

### WebSocket Parameters

```javascript
{
  model: "nova-2",           // Deepgram's latest model
  encoding: "linear16",      // PCM 16-bit encoding
  sample_rate: "16000",      // 16kHz sample rate
  channels: "1",             // Mono audio
  diarize: "true",           // Enable speaker identification
  punctuate: "true",         // Add punctuation
  interim_results: "true",   // Live transcription feel
  utterance_end_ms: "1000",  // 1 second silence = utterance end
  vad_events: "true",        // Voice activity detection
  smart_format: "true"       // Better formatting
}
```

### Audio Processing

1. Browser captures audio at 16kHz mono
2. ScriptProcessorNode converts Float32 to Int16 PCM
3. 4096-sample buffers sent to Deepgram (~256ms chunks)
4. Deepgram returns interim and final transcriptions
5. Final transcriptions include speaker diarization

### Response Structure

```javascript
{
  type: "Results",
  channel: {
    alternatives: [{
      transcript: "Hello world",
      confidence: 0.99,
      words: [
        { word: "Hello", speaker: 0, ... },
        { word: "world", speaker: 0, ... }
      ]
    }]
  },
  is_final: true,
  speech_final: true
}
```

## Need Help?

If you're still experiencing issues:
1. Check all console logs carefully
2. Test the API key directly with curl or Postman
3. Try a fresh Deepgram API key
4. Check Deepgram status: https://status.deepgram.com/
5. Review Deepgram documentation for recent changes
