import { NextResponse } from "next/server";
import { checkGroqHealth, getGroqConfig } from "@/lib/ai/groq";

export async function GET() {
  try {
    const health = await checkGroqHealth();
    const config = getGroqConfig();

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
