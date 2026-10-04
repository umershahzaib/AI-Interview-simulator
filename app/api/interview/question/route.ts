import { NextRequest, NextResponse } from "next/server";
import { generateInterviewQuestion } from "@/lib/ai/interviewer";
import { InterviewQuestionSchema } from "@/lib/types/interview";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      jobTitle,
      jobDescription,
      interviewType,
      difficulty,
      resumeContext,
      previousMessages,
      questionNumber,
      totalQuestions,
    } = body;

    // Validate required fields
    if (!jobTitle || !jobDescription || !interviewType || !difficulty) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate question
    const question = await generateInterviewQuestion({
      jobTitle,
      jobDescription,
      interviewType,
      difficulty,
      resumeContext,
      previousMessages: previousMessages || [],
      questionNumber: questionNumber || 1,
      totalQuestions: totalQuestions || 10,
    });

    // Validate the response
    const validated = InterviewQuestionSchema.parse(question);

    return NextResponse.json({ question: validated });
  } catch (error) {
    console.error("Failed to generate question:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate question",
      },
      { status: 500 }
    );
  }
}
