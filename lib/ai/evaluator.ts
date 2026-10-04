import { generateStructuredResponse } from "./groq";
import {
  EvaluationSchema,
  type Evaluation,
  type InterviewMessage,
  type InterviewType,
  type Difficulty,
} from "@/lib/types/interview";

interface EvaluationContext {
  jobTitle: string;
  jobDescription: string;
  interviewType: InterviewType;
  difficulty: Difficulty;
  messages: InterviewMessage[];
}

/**
 * Evaluate the candidate's interview performance
 */
export async function evaluateInterview(
  context: EvaluationContext
): Promise<Evaluation> {
  const { jobTitle, jobDescription, interviewType, difficulty, messages } =
    context;

  // Extract Q&A pairs
  const qaHistory = messages
    .map((msg, idx) => {
      if (msg.role === "interviewer") {
        const nextMsg = messages[idx + 1];
        if (nextMsg && nextMsg.role === "candidate") {
          return `Q${Math.floor(idx / 2) + 1}: ${msg.content}\nA${Math.floor(idx / 2) + 1}: ${nextMsg.content}`;
        }
      }
      return null;
    })
    .filter(Boolean)
    .join("\n\n");

  const systemPrompt = `You are an expert interview evaluator assessing a ${interviewType} interview for a ${jobTitle} position.

Job Description:
${jobDescription}

Interview Type: ${interviewType}
Difficulty Level: ${difficulty}

Your task is to provide a comprehensive, constructive evaluation based on the interview transcript.`;

  const prompt = `Evaluate this interview transcript and provide detailed feedback:

${qaHistory}

Provide a JSON evaluation with:
- overallScore: Overall performance (0-100)
- technicalKnowledge: Technical understanding (0-100)
- communication: Communication clarity (0-100)
- problemSolving: Problem-solving ability (0-100)
- jobRelevance: Relevance to job requirements (0-100)
- strengths: Array of 3-5 specific strengths demonstrated
- weaknesses: Array of 2-4 areas needing improvement
- improvements: Array of 3-5 actionable improvement suggestions
- betterAnswers: Array of 2-3 objects with:
  - questionNumber: Which question (1-based)
  - originalAnswer: Brief quote from their answer
  - whatToImprove: What was missing or could be better
  - exampleAnswer: A strong example answer (not too long)

Be specific, constructive, and fair. Focus on actionable feedback.

Respond ONLY with valid JSON.`;

  try {
    const evaluation = await generateStructuredResponse(
      prompt,
      EvaluationSchema,
      {
        systemPrompt,
        temperature: 0.5,
        retries: 2,
      }
    );

    return evaluation;
  } catch (error) {
    console.error("Failed to generate evaluation:", error);

    // Return a basic fallback evaluation
    return {
      overallScore: 50,
      technicalKnowledge: 50,
      communication: 50,
      problemSolving: 50,
      jobRelevance: 50,
      strengths: [
        "Participated in the interview",
        "Provided responses to questions",
      ],
      weaknesses: [
        "Evaluation could not be completed due to technical issues",
      ],
      improvements: [
        "Please try the interview again for detailed feedback",
      ],
      betterAnswers: [],
    };
  }
}

/**
 * Analyze weak topics from multiple interviews
 */
export function analyzeWeakTopics(evaluations: Evaluation[]): {
  topic: string;
  frequency: number;
  severity: number;
}[] {
  const topicMap = new Map<string, { count: number; totalScore: number }>();

  evaluations.forEach((evaluation) => {
    evaluation.weaknesses.forEach((weakness) => {
      // Extract key topics/keywords from weaknesses
      const topics = extractTopics(weakness);
      topics.forEach((topic) => {
        const existing = topicMap.get(topic) || { count: 0, totalScore: 0 };
        topicMap.set(topic, {
          count: existing.count + 1,
          totalScore: existing.totalScore + (100 - evaluation.overallScore),
        });
      });
    });
  });

  return Array.from(topicMap.entries())
    .map(([topic, data]) => ({
      topic,
      frequency: data.count,
      severity: data.totalScore / data.count,
    }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 5);
}

/**
 * Extract key topics from weakness descriptions
 */
function extractTopics(weakness: string): string[] {
  const topicKeywords = [
    "communication",
    "technical",
    "problem-solving",
    "leadership",
    "teamwork",
    "time management",
    "javascript",
    "python",
    "react",
    "algorithms",
    "data structures",
    "system design",
    "testing",
    "debugging",
    "api",
    "database",
    "async",
    "promises",
    "state management",
  ];

  const lowerWeakness = weakness.toLowerCase();
  return topicKeywords.filter((keyword) => lowerWeakness.includes(keyword));
}
