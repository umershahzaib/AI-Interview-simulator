import { z } from "zod";

// Interview Types
export const InterviewTypeEnum = z.enum([
  "hr",
  "technical",
  "behavioral",
  "mixed",
  "custom",
]);

export const DifficultyEnum = z.enum(["beginner", "intermediate", "advanced"]);

export const InterviewStatusEnum = z.enum([
  "not_started",
  "in_progress",
  "completed",
  "abandoned",
]);

// Resume Context Schema
export const ResumeContextSchema = z.object({
  name: z.string().optional(),
  skills: z.array(z.string()).optional(),
  education: z.array(z.string()).optional(),
  experience: z.array(z.string()).optional(),
  projects: z.array(z.string()).optional(),
  technologies: z.array(z.string()).optional(),
  certifications: z.array(z.string()).optional(),
});

// Interview Question Schema
export const InterviewQuestionSchema = z.object({
  question: z.string(),
  type: z.string(),
  difficulty: DifficultyEnum,
  reason: z.string().optional(),
});

// Interview Message Schema
export const InterviewMessageSchema = z.object({
  id: z.string(),
  role: z.enum(["interviewer", "candidate"]),
  content: z.string(),
  timestamp: z.number(),
  questionType: z.string().optional(),
});

// Interview State Schema
export const InterviewStateSchema = z.object({
  interviewId: z.string(),
  jobTitle: z.string(),
  jobDescription: z.string(),
  interviewType: InterviewTypeEnum,
  difficulty: DifficultyEnum,
  questionCount: z.number(),
  currentQuestionNumber: z.number(),
  messages: z.array(InterviewMessageSchema),
  resumeContext: ResumeContextSchema.optional(),
  status: InterviewStatusEnum,
  createdAt: z.number(),
  completedAt: z.number().optional(),
});

// Evaluation Schema
export const EvaluationSchema = z.object({
  overallScore: z.number().min(0).max(100),
  technicalKnowledge: z.number().min(0).max(100),
  communication: z.number().min(0).max(100),
  problemSolving: z.number().min(0).max(100),
  jobRelevance: z.number().min(0).max(100),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  improvements: z.array(z.string()),
  betterAnswers: z.array(
    z.object({
      questionNumber: z.number(),
      originalAnswer: z.string(),
      whatToImprove: z.string(),
      exampleAnswer: z.string(),
    })
  ),
});

// TypeScript Types
export type InterviewType = z.infer<typeof InterviewTypeEnum>;
export type Difficulty = z.infer<typeof DifficultyEnum>;
export type InterviewStatus = z.infer<typeof InterviewStatusEnum>;
export type ResumeContext = z.infer<typeof ResumeContextSchema>;
export type InterviewQuestion = z.infer<typeof InterviewQuestionSchema>;
export type InterviewMessage = z.infer<typeof InterviewMessageSchema>;
export type InterviewState = z.infer<typeof InterviewStateSchema>;
export type Evaluation = z.infer<typeof EvaluationSchema>;

// Interview Creation Input
export interface CreateInterviewInput {
  jobTitle: string;
  jobDescription: string;
  interviewType: InterviewType;
  difficulty: Difficulty;
  questionCount: number;
  resumeContext?: ResumeContext;
}
