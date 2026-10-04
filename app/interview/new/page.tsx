"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BrainCircuit, Upload, AlertCircle, Loader2 } from "lucide-react";
import {
  InterviewType,
  Difficulty,
  CreateInterviewInput,
  InterviewState,
  ResumeContext,
} from "@/lib/types/interview";
import { saveInterview, setCurrentInterviewId } from "@/lib/utils/storage";
import { analyzeResume } from "@/lib/ai/resume-analyzer";

export default function NewInterviewPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<CreateInterviewInput>({
    jobTitle: "",
    jobDescription: "",
    interviewType: "mixed",
    difficulty: "intermediate",
    questionCount: 10,
  });

  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeContext, setResumeContext] = useState<ResumeContext | undefined>();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [groqError, setGroqError] = useState<string | null>(null);

  // Check Groq health on mount
  useEffect(() => {
    fetch('/api/groq/health')
      .then(res => res.json())
      .then((health) => {
        if (!health.available || !health.configured) {
          setGroqError(
            health.error ||
              "Groq API is not configured. Please ensure API key is set."
          );
        }
      })
      .catch((error) => {
        setGroqError("Failed to connect to Groq API: " + error.message);
      });
  }, []);

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setError("Please upload a PDF file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      return;
    }

    setResumeFile(file);
    setIsAnalyzing(true);
    setError(null);

    try {
      const context = await analyzeResume(file);
      setResumeContext(context);
      setIsAnalyzing(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to analyze resume"
      );
      setIsAnalyzing(false);
      setResumeFile(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.jobTitle.trim()) {
      setError("Job title is required");
      return;
    }

    if (!formData.jobDescription.trim()) {
      setError("Job description is required");
      return;
    }

    // Check Groq health before starting
    const healthResponse = await fetch('/api/groq/health');
    const health = await healthResponse.json();

    if (!health.available || !health.configured) {
      setError(
        health.error ||
          "Groq API is not configured. Please check your API key in .env.local"
      );
      return;
    }

    setIsCreating(true);

    try {
      // Create interview state
      const interviewId = `interview_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const now = Date.now();

      const interview: InterviewState = {
        interviewId,
        jobTitle: formData.jobTitle,
        jobDescription: formData.jobDescription,
        interviewType: formData.interviewType,
        difficulty: formData.difficulty,
        questionCount: formData.questionCount,
        currentQuestionNumber: 0,
        messages: [],
        resumeContext,
        status: "not_started",
        createdAt: now,
      };

      // Save to storage
      saveInterview(interview);
      setCurrentInterviewId(interviewId);

      // Navigate to interview page
      router.push(`/interview/${interviewId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create interview");
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <BrainCircuit className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">InterviewAI</span>
          </Link>
          <Link href="/dashboard">
            <Button variant="ghost">Back to Dashboard</Button>
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Create New Interview</h1>
          <p className="text-muted-foreground">
            Set up your interview practice session
          </p>
        </div>

        {/* Groq Warning */}
        {groqError && (
          <Card className="mb-6 border-amber-500/50 bg-amber-500/10">
            <CardContent className="p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-500 mb-1">
                  Groq API Setup Required
                </p>
                <p className="text-sm text-muted-foreground">{groqError}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Add your API key to <code className="bg-muted px-2 py-1 rounded">.env.local</code>
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Job Title */}
          <Card>
            <CardHeader>
              <CardTitle>Job Information</CardTitle>
              <CardDescription>
                Tell us about the position you&apos;re interviewing for
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="jobTitle">Job Title *</Label>
                <Input
                  id="jobTitle"
                  placeholder="e.g., Senior Software Engineer"
                  value={formData.jobTitle}
                  onChange={(e) =>
                    setFormData({ ...formData, jobTitle: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="jobDescription">Job Description *</Label>
                <Textarea
                  id="jobDescription"
                  placeholder="Paste the job description here..."
                  rows={8}
                  value={formData.jobDescription}
                  onChange={(e) =>
                    setFormData({ ...formData, jobDescription: e.target.value })
                  }
                  required
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Include key responsibilities, required skills, and qualifications
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Resume Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Resume (Optional)</CardTitle>
              <CardDescription>
                Upload your resume for personalized questions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Label
                    htmlFor="resume"
                    className="cursor-pointer flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-accent"
                  >
                    <Upload className="h-4 w-4" />
                    {resumeFile ? "Change Resume" : "Upload Resume (PDF)"}
                  </Label>
                  <Input
                    id="resume"
                    type="file"
                    accept="application/pdf"
                    onChange={handleResumeUpload}
                    className="hidden"
                  />
                  {resumeFile && (
                    <span className="text-sm text-muted-foreground">
                      {resumeFile.name}
                    </span>
                  )}
                </div>

                {isAnalyzing && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing resume...
                  </div>
                )}

                {resumeContext && (
                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <p className="text-sm font-medium mb-2">Resume Analyzed</p>
                    <div className="text-sm text-muted-foreground space-y-1">
                      {resumeContext.name && <p>Name: {resumeContext.name}</p>}
                      {resumeContext.skills && resumeContext.skills.length > 0 && (
                        <p>Skills: {resumeContext.skills.slice(0, 5).join(", ")}</p>
                      )}
                      {resumeContext.technologies &&
                        resumeContext.technologies.length > 0 && (
                          <p>
                            Technologies: {resumeContext.technologies.slice(0, 5).join(", ")}
                          </p>
                        )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Interview Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Interview Settings</CardTitle>
              <CardDescription>
                Customize your interview experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="interviewType">Interview Type</Label>
                <Select
                  value={formData.interviewType}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      interviewType: value as InterviewType,
                    })
                  }
                >
                  <SelectTrigger id="interviewType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hr">HR Interview</SelectItem>
                    <SelectItem value="technical">Technical Interview</SelectItem>
                    <SelectItem value="behavioral">Behavioral Interview</SelectItem>
                    <SelectItem value="mixed">Mixed Interview</SelectItem>
                    <SelectItem value="custom">Custom Interview</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="difficulty">Difficulty Level</Label>
                <Select
                  value={formData.difficulty}
                  onValueChange={(value) =>
                    setFormData({ ...formData, difficulty: value as Difficulty })
                  }
                >
                  <SelectTrigger id="difficulty">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="questionCount">Number of Questions</Label>
                <Select
                  value={formData.questionCount.toString()}
                  onValueChange={(value) =>
                    setFormData({ ...formData, questionCount: parseInt(value) })
                  }
                >
                  <SelectTrigger id="questionCount">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 Questions</SelectItem>
                    <SelectItem value="10">10 Questions</SelectItem>
                    <SelectItem value="15">15 Questions</SelectItem>
                    <SelectItem value="20">20 Questions</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Error Display */}
          {error && (
            <Card className="border-destructive/50 bg-destructive/10">
              <CardContent className="p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                <p className="text-sm text-destructive">{error}</p>
              </CardContent>
            </Card>
          )}

          {/* Submit Button */}
          <div className="flex gap-4">
            <Link href="/dashboard" className="flex-1">
              <Button type="button" variant="outline" className="w-full">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={isCreating || isAnalyzing}
              className="flex-1"
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Start Interview"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
