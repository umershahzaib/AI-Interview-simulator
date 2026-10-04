import { NextResponse } from "next/server";
import { checkGeminiHealth, getGeminiConfig } from "@/lib/ai/gemini";

export async function GET() {
  try {
    const health = await checkGeminiHealth();
    const config = getGeminiConfig();

    return NextResponse.json({
      ...health,
      config,
    });
  } catch (error) {
    return NextResponse.json(
      {
        available: false,
        configured: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
