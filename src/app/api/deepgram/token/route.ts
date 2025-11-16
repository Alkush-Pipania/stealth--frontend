import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.DEEPGRAM_API_KEY;

  if (!apiKey) {
    console.error("❌ DEEPGRAM_API_KEY not found in environment variables");
    return NextResponse.json(
      { error: "Deepgram API key not configured" },
      { status: 500 }
    );
  }

  // Trim the API key to remove any accidental whitespace
  const trimmedKey = apiKey.trim();

  // Validate API key format (basic check)
  if (trimmedKey.length < 20) {
    console.error("❌ DEEPGRAM_API_KEY appears to be invalid (too short)");
    return NextResponse.json(
      { error: "Deepgram API key appears to be invalid" },
      { status: 500 }
    );
  }

  console.log("✅ Deepgram API key found. Length:", trimmedKey.length);
  console.log("🔑 First 10 chars:", trimmedKey.substring(0, 10) + "...");

  // Return the API key for client-side use
  // NOTE: In production, you should use Deepgram's temporary key generation
  // to avoid exposing your main API key to clients
  return NextResponse.json({ key: trimmedKey });
}

