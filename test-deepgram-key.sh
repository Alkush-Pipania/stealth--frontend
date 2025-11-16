#!/bin/bash

# Test Deepgram API Key
echo "🔍 Testing Deepgram API Key..."
echo ""

# Load the API key from .env or .env.local
if [ -f .env.local ]; then
    source .env.local
    echo "✅ Loaded .env.local"
elif [ -f .env ]; then
    source .env
    echo "✅ Loaded .env"
else
    echo "❌ No .env or .env.local file found"
    exit 1
fi

# Check if API key is set
if [ -z "$DEEPGRAM_API_KEY" ]; then
    echo "❌ DEEPGRAM_API_KEY is not set"
    exit 1
fi

echo "🔑 API Key: ${DEEPGRAM_API_KEY:0:10}..."
echo ""
echo "📡 Testing API key with Deepgram..."
echo ""

# Test the API key with a simple request
response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
  --request GET \
  --url 'https://api.deepgram.com/v1/projects' \
  --header "Authorization: Token $DEEPGRAM_API_KEY")

http_status=$(echo "$response" | grep "HTTP_STATUS" | cut -d':' -f2)
body=$(echo "$response" | sed '/HTTP_STATUS/d')

echo "Response Status: $http_status"
echo ""

if [ "$http_status" = "200" ]; then
    echo "✅ API Key is VALID!"
    echo ""
    echo "Your Deepgram API key is working correctly."
    echo "The WebSocket issue might be due to:"
    echo "  1. Browser CORS policy"
    echo "  2. Network/firewall blocking WebSocket connections"
    echo "  3. Try using a different model or parameters"
elif [ "$http_status" = "401" ]; then
    echo "❌ API Key is INVALID!"
    echo ""
    echo "Your API key is not recognized by Deepgram."
    echo "Please:"
    echo "  1. Get a new API key from https://console.deepgram.com/"
    echo "  2. Make sure you copied the entire key"
    echo "  3. Check for extra spaces or line breaks"
else
    echo "⚠️  Unexpected response: $http_status"
    echo "Response body:"
    echo "$body"
fi

