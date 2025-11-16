import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.DEEPGRAM_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Deepgram API key not configured" },
      { status: 500 }
    );
  }

  // Return the API key for client-side use
  // In production, you might want to use Deepgram's temporary key generation
  return NextResponse.json({ key: apiKey });
}

