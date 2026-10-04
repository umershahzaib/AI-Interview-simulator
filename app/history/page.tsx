"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BrainCircuit,
  Plus,
  Calendar,
  Briefcase,
  TrendingUp,
  Clock,
  AlertCircle,
} from "lucide-react";
import { getAllInterviews } from "@/lib/utils/storage";
import { InterviewState, InterviewType, Difficulty } from "@/lib/types/interview";

type FilterType = "all" | InterviewType;
type FilterDifficulty = "all" | Difficulty;
type FilterStatus = "all" | "completed" | "in_progress" | "not_started" | "abandoned";

export default function HistoryPage() {
  const router = useRouter();
  const [interviews, setInterviews] = useState<InterviewState[]>([]);
  const [filteredInterviews, setFilteredInterviews] = useState<InterviewState[]>([]);
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [filterDifficulty, setFilterDifficulty] = useState<FilterDifficulty>("all");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");

  useEffect(() => {
    const allInterviews = getAllInterviews();
    setInterviews(allInterviews);
    setFilteredInterviews(allInterviews);
  }, []);

  useEffect(() => {
    let filtered = interviews;

    if (filterType !== "all") {
      filtered = filtered.filter((i) => i.interviewType === filterType);
    }

    if (filterDifficulty !== "all") {
      filtered = filtered.filter((i) => i.difficulty === filterDifficulty);
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter((i) => i.status === filterStatus);
    }

    setFilteredInterviews(filtered);
  }, [interviews, filterType, filterDifficulty, filterStatus]);

  const handleInterviewClick = (interview: InterviewState) => {
    if (interview.status === "completed") {
      router.push(`/interview/${interview.interviewId}/results`);
    } else if (interview.status === "in_progress") {
      router.push(`/interview/${interview.interviewId}`);
    } else {
      router.push(`/interview/${interview.interviewId}`);
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
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost">Dashboard</Button>
            </Link>
            <Link href="/interview/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Interview
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Interview History</h1>
          <p className="text-muted-foreground">
            Review your past interview practice sessions
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Filter Interviews</CardTitle>
            <CardDescription>Narrow down your search</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Interview Type
                </label>
                <Select
                  value={filterType}
                  onValueChange={(value) => setFilterType(value as FilterType)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="hr">HR</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="behavioral">Behavioral</SelectItem>
                    <SelectItem value="mixed">Mixed</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Difficulty
                </label>
                <Select
                  value={filterDifficulty}
                  onValueChange={(value) =>
                    setFilterDifficulty(value as FilterDifficulty)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <Select
                  value={filterStatus}
                  onValueChange={(value) => setFilterStatus(value as FilterStatus)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="not_started">Not Started</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader>
            <CardTitle>
              {filteredInterviews.length} Interview
              {filteredInterviews.length !== 1 ? "s" : ""}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredInterviews.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">No interviews found</h3>
                <p className="text-muted-foreground mb-6">
                  {interviews.length === 0
                    ? "Start your first interview to see it here"
                    : "Try adjusting your filters"}
                </p>
                {interviews.length === 0 && (
                  <Link href="/interview/new">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Interview
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredInterviews.map((interview) => (
                  <InterviewHistoryCard
                    key={interview.interviewId}
                    interview={interview}
                    onClick={() => handleInterviewClick(interview)}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function InterviewHistoryCard({
  interview,
  onClick,
}: {
  interview: InterviewState;
  onClick: () => void;
}) {
  const statusColors = {
    not_started: "bg-gray-500",
    in_progress: "bg-blue-500",
    completed: "bg-green-500",
    abandoned: "bg-red-500",
  };

  const statusLabels = {
    not_started: "Not Started",
    in_progress: "In Progress",
    completed: "Completed",
    abandoned: "Abandoned",
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      onClick={onClick}
      className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg border hover:bg-accent cursor-pointer transition-colors gap-4"
    >
      <div className="flex-1 space-y-2">
        <div className="flex items-start gap-3">
          <Briefcase className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="font-semibold mb-1">{interview.jobTitle}</h4>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="capitalize">
                {interview.interviewType} Interview
              </span>
              <span>•</span>
              <span className="capitalize">{interview.difficulty}</span>
              <span>•</span>
              <span>
                {interview.currentQuestionNumber} / {interview.questionCount}{" "}
                questions
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground ml-8">
          <Calendar className="h-4 w-4" />
          <span>{formatDate(interview.createdAt)}</span>
          {interview.completedAt && (
            <>
              <span>•</span>
              <Clock className="h-4 w-4" />
              <span>
                Completed {formatDate(interview.completedAt)}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 md:ml-4">
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${statusColors[interview.status]}`}
          />
          <span className="text-sm font-medium">
            {statusLabels[interview.status]}
          </span>
        </div>
        <Button variant="ghost" size="sm">
          {interview.status === "completed" ? "View Results" : "Continue"}
        </Button>
      </div>
    </div>
  );
}
