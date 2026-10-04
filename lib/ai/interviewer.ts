import { generateStructuredResponse, generateCompletion } from "./groq";
import {
  InterviewQuestionSchema,
  type InterviewQuestion,
  type InterviewType,
  type Difficulty,
  type ResumeContext,
  type InterviewMessage,
} from "@/lib/types/interview";

interface GenerateQuestionContext {
  jobTitle: string;
  jobDescription: string;
  interviewType: InterviewType;
  difficulty: Difficulty;
  resumeContext?: ResumeContext;
  previousMessages: InterviewMessage[];
  questionNumber: number;
  totalQuestions: number;
}

/**
 * Generate a dynamic interview question based on context and previous answers
 */
export async function generateInterviewQuestion(
  context: GenerateQuestionContext
): Promise<InterviewQuestion> {
  const {
    jobTitle,
    jobDescription,
    interviewType,
    difficulty,
    resumeContext,
    previousMessages,
    questionNumber,
    totalQuestions,
  } = context;

  // Build context about previous conversation
  const conversationContext = previousMessages
    .slice(-4) // Last 2 Q&A pairs
    .map((msg) => `${msg.role === "interviewer" ? "Q" : "A"}: ${msg.content}`)
    .join("\n");

  // Build resume context string
  const resumeInfo = resumeContext
    ? `
Candidate Background:
- Skills: ${resumeContext.skills?.join(", ") || "Not provided"}
- Experience: ${resumeContext.experience?.join("; ") || "Not provided"}
- Projects: ${resumeContext.projects?.join("; ") || "Not provided"}
- Technologies: ${resumeContext.technologies?.join(", ") || "Not provided"}
`
    : "";

  const systemPrompt = `You are an expert ${interviewType} interviewer conducting an interview for a ${jobTitle} position.

Interview Type: ${interviewType}
Difficulty Level: ${difficulty}
Question ${questionNumber} of ${totalQuestions}

Job Description:
${jobDescription}

${resumeInfo}

${conversationContext ? `Previous Conversation:\n${conversationContext}\n` : ""}

Guidelines:
1. Ask ONE specific, relevant question
2. For follow-up questions, reference the candidate's previous answer
3. Maintain natural conversation flow
4. Adjust difficulty based on ${difficulty} level
5. Focus on ${interviewType} aspects
6. Keep questions concise and clear
7. Avoid repeating topics already covered

${
  questionNumber === 1
    ? "Start with an appropriate opening question."
    : "Generate a follow-up question that builds on the conversation."
}`;

  const prompt = `Generate the next interview question as a JSON object with these fields:
- question: The interview question to ask
- type: The category (technical, behavioral, situational, experience, or problem-solving)
- difficulty: ${difficulty}
- reason: Brief explanation of why this question is relevant (1 sentence)

Respond ONLY with valid JSON.`;

  try {
    const question = await generateStructuredResponse(
      prompt,
      InterviewQuestionSchema,
      {
        systemPrompt,
        temperature: 0.7,
        retries: 2,
      }
    );

    return question;
  } catch (error) {
    // Fallback question if generation fails
    console.error("Failed to generate question:", error);
    return {
      question: getFallbackQuestion(interviewType, questionNumber),
      type: interviewType,
      difficulty,
      reason: "Fallback question due to generation error",
    };
  }
}

/**
 * Generate the opening greeting for the interview
 */
export async function generateOpeningMessage(
  jobTitle: string,
  interviewType: InterviewType,
  candidateName?: string
): Promise<string> {
  const greeting = candidateName
    ? `Hello ${candidateName}! `
    : "Hello! ";

  const systemPrompt = `You are a friendly ${interviewType} interviewer.`;

  const prompt = `Generate a brief, professional opening message (2-3 sentences) for an interview for the position of ${jobTitle}.

The message should:
- Welcome the candidate warmly
- Briefly mention this is a ${interviewType} interview
- Encourage them to take their time and ask for clarification if needed

Keep it natural and conversational.`;

  try {
    const message = await generateCompletion(prompt, {
      systemPrompt,
      temperature: 0.8,
    });

    return greeting + message.trim();
  } catch (error) {
    // Fallback greeting
    return (
      greeting +
      `Welcome to your ${interviewType} interview for the ${jobTitle} position. I'll be asking you a series of questions to understand your qualifications and experience. Take your time with each answer, and feel free to ask for clarification if needed. Let's begin!`
    );
  }
}

/**
 * Fallback questions if AI generation fails
 */
function getFallbackQuestion(
  interviewType: InterviewType,
  questionNumber: number
): string {
  const fallbackQuestions: Record<InterviewType, string[]> = {
    hr: [
      "Tell me about yourself and your professional background.",
      "Why are you interested in this position?",
      "What are your greatest strengths?",
      "Where do you see yourself in five years?",
    ],
    technical: [
      "Describe your experience with the technologies mentioned in the job description.",
      "Can you walk me through a challenging technical problem you've solved?",
      "How do you approach debugging and troubleshooting?",
      "What's your experience with version control systems?",
    ],
    behavioral: [
      "Tell me about a time when you faced a significant challenge at work.",
      "Describe a situation where you had to work with a difficult team member.",
      "Give me an example of when you demonstrated leadership.",
      "Tell me about a time you failed and what you learned from it.",
    ],
    mixed: [
      "Tell me about your background and what brings you to this position.",
      "Describe a project you're particularly proud of.",
      "How do you handle tight deadlines and pressure?",
      "What interests you most about this role?",
    ],
    custom: [
      "Tell me about your relevant experience for this position.",
      "What makes you a good fit for this role?",
      "Describe your work style and how you approach projects.",
      "What are you looking for in your next opportunity?",
    ],
  };

  const questions = fallbackQuestions[interviewType];
  const index = (questionNumber - 1) % questions.length;
  return questions[index];
}
