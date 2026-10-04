import { NextRequest, NextResponse } from "next/server";
import { evaluateInterview } from "@/lib/ai/evaluator";
import { EvaluationSchema } from "@/lib/types/interview";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { jobTitle, jobDescription, interviewType, difficulty, messages } =
      body;

    // Validate required fields
    if (
      !jobTitle ||
      !jobDescription ||
      !interviewType ||
      !difficulty ||
      !messages
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate evaluation
    const evaluation = await evaluateInterview({
      jobTitle,
      jobDescription,
      interviewType,
      difficulty,
      messages,
    });

    // Validate the response
    const validated = EvaluationSchema.parse(evaluation);

    return NextResponse.json({ evaluation: validated });
  } catch (error) {
    console.error("Failed to generate evaluation:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate evaluation",
      },
      { status: 500 }
    );
  }
}
