import { NextRequest, NextResponse } from "next/server";
import { generateOpeningMessage } from "@/lib/ai/interviewer";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jobTitle, interviewType, candidateName } = body;

    if (!jobTitle || !interviewType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const message = await generateOpeningMessage(
      jobTitle,
      interviewType,
      candidateName
    );

    return NextResponse.json({ message });
  } catch (error) {
    console.error("Failed to generate opening:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to generate opening",
      },
      { status: 500 }
    );
  }
}
