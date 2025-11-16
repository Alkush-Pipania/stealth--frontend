import { createClient } from "@deepgram/sdk";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const apiKey = process.env.DEEPGRAM_API_KEY;

  if (!apiKey) {
    console.error("DEEPGRAM_API_KEY is not set");
    return NextResponse.json(
      { error: "Deepgram API key not configured" },
      { status: 500 }
    );
  }

  try {
    const deepgram = createClient(apiKey);

    // Create a temporary key for browser client
    // This key expires after a set time (default: 10 seconds)
    const { result: projectsResult, error: projectsError } =
      await deepgram.manage.getProjects();

    if (projectsError) {
      throw projectsError;
    }

    const project = projectsResult?.projects[0];

    if (!project) {
      throw new Error("No Deepgram project found");
    }

    const { result: keyResult, error: keyError } =
      await deepgram.manage.createProjectKey(project.project_id, {
        comment: "Temporary key for browser client",
        scopes: ["usage:write"],
        time_to_live_in_seconds: 3600, // 1 hour
      });

    if (keyError) {
      throw keyError;
    }

    return NextResponse.json({
      key: keyResult?.key,
    });
  } catch (error) {
    console.error("Failed to create temporary Deepgram key:", error);
    return NextResponse.json(
      { error: "Failed to create temporary key" },
      { status: 500 }
    );
  }
}
