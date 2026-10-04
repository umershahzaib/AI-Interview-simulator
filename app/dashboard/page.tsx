"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BrainCircuit,
  Plus,
  TrendingUp,
  Clock,
  Target,
  AlertCircle,
} from "lucide-react";
import { getAllInterviews } from "@/lib/utils/storage";
import { InterviewState } from "@/lib/types/interview";

export default function DashboardPage() {
  const router = useRouter();
  const [interviews, setInterviews] = useState<InterviewState[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    avgScore: 0,
  });

  useEffect(() => {
    const allInterviews = getAllInterviews();
    setInterviews(allInterviews);

    // Calculate stats
    const completed = allInterviews.filter(
      (i) => i.status === "completed"
    ).length;

    setStats({
      total: allInterviews.length,
      completed,
      avgScore: 0, // Will calculate from evaluations later
    });
  }, []);

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
            <Link href="/history">
              <Button variant="ghost">History</Button>
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
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Track your interview practice progress
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <StatCard
            icon={<Target className="h-5 w-5" />}
            label="Total Interviews"
            value={stats.total}
          />
          <StatCard
            icon={<TrendingUp className="h-5 w-5" />}
            label="Completed"
            value={stats.completed}
          />
          <StatCard
            icon={<Clock className="h-5 w-5" />}
            label="In Progress"
            value={stats.total - stats.completed}
          />
        </div>

        {/* Recent Interviews */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Interviews</CardTitle>
            <CardDescription>
              Your latest interview practice sessions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {interviews.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">
                  No interviews yet
                </h3>
                <p className="text-muted-foreground mb-6">
                  Start your first interview to see it here
                </p>
                <Link href="/interview/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Interview
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {interviews.slice(0, 5).map((interview) => (
                  <InterviewCard
                    key={interview.interviewId}
                    interview={interview}
                    onClick={() => {
                      if (interview.status === "completed") {
                        router.push(
                          `/interview/${interview.interviewId}/results`
                        );
                      } else {
                        router.push(`/interview/${interview.interviewId}`);
                      }
                    }}
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

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{label}</p>
            <p className="text-3xl font-bold">{value}</p>
          </div>
          <div className="text-primary">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function InterviewCard({
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

  return (
    <div
      onClick={onClick}
      className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent cursor-pointer transition-colors"
    >
      <div className="flex-1">
        <h4 className="font-semibold mb-1">{interview.jobTitle}</h4>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="capitalize">{interview.interviewType} Interview</span>
          <span className="capitalize">{interview.difficulty}</span>
          <span>
            {interview.currentQuestionNumber} / {interview.questionCount} questions
          </span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${statusColors[interview.status]}`}
          />
          <span className="text-sm capitalize">
            {interview.status.replace("_", " ")}
          </span>
        </div>
        <Button variant="ghost" size="sm">
          View
        </Button>
      </div>
    </div>
  );
}
