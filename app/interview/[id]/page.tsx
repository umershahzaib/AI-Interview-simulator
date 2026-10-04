"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  BrainCircuit,
  Send,
  Loader2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import {
  InterviewState,
  InterviewMessage,
  InterviewQuestion,
} from "@/lib/types/interview";
import {
  getInterview,
  saveInterview,
  getCurrentInterviewId,
} from "@/lib/utils/storage";

export default function InterviewPage() {
  const params = useParams();
  const router = useRouter();
  const interviewId = params.id as string;

  const [interview, setInterview] = useState<InterviewState | null>(null);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load interview from storage
  useEffect(() => {
    const loadedInterview = getInterview(interviewId);
    if (!loadedInterview) {
      router.push("/dashboard");
      return;
    }
    setInterview(loadedInterview);

    // Start interview if not started
    if (loadedInterview.status === "not_started") {
      startInterview(loadedInterview);
    }
  }, [interviewId, router]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [interview?.messages]);

  const startInterview = async (interviewState: InterviewState) => {
    setIsStarting(true);
    setError(null);

    try {
      // Generate opening message
      const response = await fetch("/api/interview/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobTitle: interviewState.jobTitle,
          interviewType: interviewState.interviewType,
          candidateName: interviewState.resumeContext?.name,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to start interview");
      }

      const { message } = await response.json();

      // Generate first question
      const questionResponse = await fetch("/api/interview/question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobTitle: interviewState.jobTitle,
          jobDescription: interviewState.jobDescription,
          interviewType: interviewState.interviewType,
          difficulty: interviewState.difficulty,
          resumeContext: interviewState.resumeContext,
          previousMessages: [],
          questionNumber: 1,
          totalQuestions: interviewState.questionCount,
        }),
      });

      if (!questionResponse.ok) {
        throw new Error("Failed to generate first question");
      }

      const { question } = await questionResponse.json();

      // Add opening message
      const openingMessage: InterviewMessage = {
        id: `msg_${Date.now()}_1`,
        role: "interviewer",
        content: message,
        timestamp: Date.now(),
      };

      // Add first question
      const firstQuestion: InterviewMessage = {
        id: `msg_${Date.now()}_2`,
        role: "interviewer",
        content: question.question,
        timestamp: Date.now() + 1,
        questionType: question.type,
      };

      const updatedInterview: InterviewState = {
        ...interviewState,
        status: "in_progress",
        currentQuestionNumber: 1,
        messages: [openingMessage, firstQuestion],
      };

      saveInterview(updatedInterview);
      setInterview(updatedInterview);
      setIsStarting(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start interview");
      setIsStarting(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!currentAnswer.trim() || !interview || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      // Add user's answer to messages
      const answerMessage: InterviewMessage = {
        id: `msg_${Date.now()}`,
        role: "candidate",
        content: currentAnswer,
        timestamp: Date.now(),
      };

      const updatedMessages = [...interview.messages, answerMessage];

      // Check if we've reached the question limit
      const isLastQuestion =
        interview.currentQuestionNumber >= interview.questionCount;

      if (isLastQuestion) {
        // Interview complete - go to evaluation
        const completedInterview: InterviewState = {
          ...interview,
          messages: updatedMessages,
          status: "completed",
          completedAt: Date.now(),
        };

        saveInterview(completedInterview);
        router.push(`/interview/${interviewId}/results`);
        return;
      }

      // Generate next question
      const response = await fetch("/api/interview/question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobTitle: interview.jobTitle,
          jobDescription: interview.jobDescription,
          interviewType: interview.interviewType,
          difficulty: interview.difficulty,
          resumeContext: interview.resumeContext,
          previousMessages: updatedMessages,
          questionNumber: interview.currentQuestionNumber + 1,
          totalQuestions: interview.questionCount,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate next question");
      }

      const { question }: { question: InterviewQuestion } = await response.json();

      // Add next question to messages
      const questionMessage: InterviewMessage = {
        id: `msg_${Date.now()}_q`,
        role: "interviewer",
        content: question.question,
        timestamp: Date.now(),
        questionType: question.type,
      };

      const finalMessages = [...updatedMessages, questionMessage];

      const updatedInterview: InterviewState = {
        ...interview,
        messages: finalMessages,
        currentQuestionNumber: interview.currentQuestionNumber + 1,
      };

      saveInterview(updatedInterview);
      setInterview(updatedInterview);
      setCurrentAnswer("");
      setIsLoading(false);

      // Focus textarea
      setTimeout(() => textareaRef.current?.focus(), 100);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to submit answer"
      );
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmitAnswer();
    }
  };

  if (!interview) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const progress =
    (interview.currentQuestionNumber / interview.questionCount) * 100;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <Link href="/dashboard" className="flex items-center gap-2">
              <BrainCircuit className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">InterviewAI</span>
            </Link>
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                Exit Interview
              </Button>
            </Link>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{interview.jobTitle}</span>
              <span className="text-muted-foreground">
                Question {interview.currentQuestionNumber} of{" "}
                {interview.questionCount}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="capitalize">{interview.interviewType} Interview</span>
              <span>•</span>
              <span className="capitalize">{interview.difficulty}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          {isStarting ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Starting interview...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {interview.messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}

              {isLoading && (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="text-sm">Generating next question...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t bg-card">
        <div className="container mx-auto px-4 py-4 max-w-4xl">
          {error && (
            <Card className="mb-4 border-destructive/50 bg-destructive/10">
              <CardContent className="p-3 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <p className="text-sm text-destructive">{error}</p>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-3">
            <Textarea
              ref={textareaRef}
              placeholder="Type your answer here... (Press Enter to send, Shift+Enter for new line)"
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={isLoading || isStarting}
              className="resize-none"
              rows={3}
            />
            <Button
              onClick={handleSubmitAnswer}
              disabled={!currentAnswer.trim() || isLoading || isStarting}
              size="lg"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Press Enter to submit, Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: InterviewMessage }) {
  const isInterviewer = message.role === "interviewer";

  return (
    <div
      className={`flex ${isInterviewer ? "justify-start" : "justify-end"}`}
    >
      <div
        className={`max-w-[80%] rounded-lg p-4 ${
          isInterviewer
            ? "bg-card border"
            : "bg-primary text-primary-foreground"
        }`}
      >
        <div className="flex items-center gap-2 mb-2">
          {isInterviewer ? (
            <BrainCircuit className="h-4 w-4" />
          ) : (
            <CheckCircle className="h-4 w-4" />
          )}
          <span className="text-sm font-medium">
            {isInterviewer ? "Interviewer" : "You"}
          </span>
          {message.questionType && (
            <span className="text-xs opacity-70 capitalize">
              ({message.questionType})
            </span>
          )}
        </div>
        <p className="whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  );
}
