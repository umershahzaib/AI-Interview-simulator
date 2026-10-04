"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  BrainCircuit,
  TrendingUp,
  TrendingDown,
  Lightbulb,
  CheckCircle,
  XCircle,
  Home,
  RotateCcw,
  Loader2,
} from "lucide-react";
import { InterviewState, Evaluation } from "@/lib/types/interview";
import { getInterview } from "@/lib/utils/storage";

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const interviewId = params.id as string;

  const [interview, setInterview] = useState<InterviewState | null>(null);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadedInterview = getInterview(interviewId);
    if (!loadedInterview) {
      router.push("/dashboard");
      return;
    }

    if (loadedInterview.status !== "completed") {
      router.push(`/interview/${interviewId}`);
      return;
    }

    setInterview(loadedInterview);
    generateEvaluation(loadedInterview);
  }, [interviewId, router]);

  const generateEvaluation = async (interviewState: InterviewState) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/interview/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobTitle: interviewState.jobTitle,
          jobDescription: interviewState.jobDescription,
          interviewType: interviewState.interviewType,
          difficulty: interviewState.difficulty,
          messages: interviewState.messages,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate evaluation");
      }

      const { evaluation: evalData } = await response.json();
      setEvaluation(evalData);
      setIsLoading(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate evaluation"
      );
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg font-medium">Evaluating your interview...</p>
        <p className="text-sm text-muted-foreground mt-2">
          This may take a moment
        </p>
      </div>
    );
  }

  if (error || !interview || !evaluation) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <XCircle className="h-12 w-12 text-destructive mb-4" />
        <p className="text-lg font-medium mb-4">
          {error || "Failed to load results"}
        </p>
        <Link href="/dashboard">
          <Button>Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <BrainCircuit className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">InterviewAI</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="ghost">
                <Home className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <Link href="/interview/new">
              <Button>
                <RotateCcw className="h-4 w-4 mr-2" />
                New Interview
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Interview Complete!</h1>
          <p className="text-muted-foreground">
            Here&apos;s your detailed performance evaluation
          </p>
        </div>

        {/* Interview Summary */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Interview Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Position</p>
                <p className="font-medium">{interview.jobTitle}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Interview Type</p>
                <p className="font-medium capitalize">
                  {interview.interviewType} Interview
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Difficulty</p>
                <p className="font-medium capitalize">{interview.difficulty}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Questions Answered</p>
                <p className="font-medium">{interview.questionCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Scores */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Performance Scores</CardTitle>
            <CardDescription>
              Your performance across key evaluation criteria
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <ScoreBar
              label="Overall Score"
              score={evaluation.overallScore}
              color="primary"
            />
            <ScoreBar
              label="Technical Knowledge"
              score={evaluation.technicalKnowledge}
            />
            <ScoreBar label="Communication" score={evaluation.communication} />
            <ScoreBar
              label="Problem Solving"
              score={evaluation.problemSolving}
            />
            <ScoreBar label="Job Relevance" score={evaluation.jobRelevance} />
          </CardContent>
        </Card>

        {/* Strengths */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Strengths
            </CardTitle>
            <CardDescription>What you did well</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {evaluation.strengths.map((strength, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Areas to Improve */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-amber-500" />
              Areas to Improve
            </CardTitle>
            <CardDescription>Opportunities for growth</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {evaluation.weaknesses.map((weakness, index) => (
                <li key={index} className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                  <span>{weakness}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Improvement Suggestions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-blue-500" />
              Improvement Suggestions
            </CardTitle>
            <CardDescription>Actionable steps to improve</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {evaluation.improvements.map((improvement, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Lightbulb className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span>{improvement}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Better Answer Examples */}
        {evaluation.betterAnswers.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Better Answer Examples</CardTitle>
              <CardDescription>
                Learn from these example improvements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {evaluation.betterAnswers.map((example, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-4 space-y-4 bg-muted/30"
                >
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      Question {example.questionNumber}
                    </p>
                    <p className="text-sm italic">&quot;{example.originalAnswer}&quot;</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-amber-500 mb-1">
                      What to improve:
                    </p>
                    <p className="text-sm">{example.whatToImprove}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-green-500 mb-1">
                      Example of a stronger answer:
                    </p>
                    <p className="text-sm bg-card p-3 rounded border">
                      {example.exampleAnswer}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/interview/new" className="flex-1">
            <Button className="w-full" size="lg">
              <RotateCcw className="h-4 w-4 mr-2" />
              Practice Again
            </Button>
          </Link>
          <Link href="/dashboard" className="flex-1">
            <Button variant="outline" className="w-full" size="lg">
              <Home className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function ScoreBar({
  label,
  score,
  color = "default",
}: {
  label: string;
  score: number;
  color?: "primary" | "default";
}) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-blue-500";
    if (score >= 40) return "text-amber-500";
    return "text-red-500";
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium">{label}</span>
        <span className={`font-bold text-lg ${getScoreColor(score)}`}>
          {score}/100
        </span>
      </div>
      <Progress
        value={score}
        className={color === "primary" ? "h-3" : "h-2"}
      />
    </div>
  );
}
