import { NextResponse } from "next/server";
import { checkOllamaHealth, getOllamaConfig } from "@/lib/ai/ollama";

export async function GET() {
  try {
    const health = await checkOllamaHealth();
    const config = getOllamaConfig();

    return NextResponse.json({
      ...health,
      config,
    });
  } catch (error) {
    return NextResponse.json(
      {
        available: false,
        modelInstalled: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
