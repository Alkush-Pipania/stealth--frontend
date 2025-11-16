# Quick Deepgram API Key Test

## Step 1: Check if API key is set

Run this in your terminal:

```bash
cd /Users/alkushpipania/Desktop/stealth/application
grep DEEPGRAM_API_KEY .env.local
```

If you see "No such file or directory", you need to create `.env.local`

## Step 2: Create .env.local file

```bash
# Create the file
echo "DEEPGRAM_API_KEY=your_actual_api_key_here" > .env.local
```

Replace `your_actual_api_key_here` with your actual Deepgram API key from:
https://console.deepgram.com/

Your key should look like: `abcd1234efgh5678ijkl9012mnop3456qrst7890`

## Step 3: Restart the dev server

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

## Step 4: Test the API endpoint

Open this in your browser while dev server is running:
http://localhost:3000/api/deepgram/token

You should see:
```json
{"key":"your_api_key_here..."}
```

If you see an error, the API key is not set correctly.

## Step 5: Check browser console

After restarting and refreshing the page, look for:
```
✅ Deepgram API key loaded
🔑 API Key loaded: abcd1234ef...
```

If you don't see these, the API key is not being loaded.
