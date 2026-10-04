"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  BrainCircuit,
  MessageSquare,
  Target,
  TrendingUp,
  CheckCircle,
  Sparkles,
} from "lucide-react";
import { useScrollAnimation } from "@/lib/hooks/useScrollAnimation";

export default function HomePage() {
  const featuresSection = useScrollAnimation();
  const howItWorksSection = useScrollAnimation();
  const ctaSection = useScrollAnimation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
              <Button>Start Interview</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="text-center max-w-4xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium animate-fade-in">
            <Sparkles className="h-4 w-4 animate-pulse" />
            Powered by Groq AI (Llama 3.3)
          </div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight animate-slide-up animate-delay-100">
            Practice Interviews.
            <br />
            <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-red-600">Build Confidence.</span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-slide-up animate-delay-200">
            An AI-powered interview simulator that adapts to your role, resume,
            and answers. Get detailed feedback and improve your interview skills.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up animate-delay-300">
            <Link href="/interview/new">
              <Button size="lg" className="text-lg px-8 hover-lift bg-gradient-primary hover:opacity-90">
                Start Interview
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="text-lg px-8 hover-lift">
                View Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20" ref={featuresSection.elementRef}>
        <div className="text-center mb-16">
          <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${featuresSection.isVisible ? 'animate-slide-up' : 'opacity-0'}`}>
            Why InterviewAI?
          </h2>
          <p className={`text-muted-foreground text-lg ${featuresSection.isVisible ? 'animate-slide-up animate-delay-100' : 'opacity-0'}`}>
            Everything you need to ace your next interview
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className={featuresSection.isVisible ? 'animate-slide-up animate-delay-100' : 'opacity-0'}>
            <FeatureCard
              icon={<BrainCircuit className="h-10 w-10 text-primary" />}
              title="AI-Powered Interviews"
              description="Dynamic questions that adapt to your answers, just like a real interviewer."
            />
          </div>
          <div className={featuresSection.isVisible ? 'animate-slide-up animate-delay-200' : 'opacity-0'}>
            <FeatureCard
              icon={<MessageSquare className="h-10 w-10 text-primary" />}
              title="Resume-Aware Questions"
              description="Upload your resume and get personalized questions based on your experience."
            />
          </div>
          <div className={featuresSection.isVisible ? 'animate-slide-up animate-delay-300' : 'opacity-0'}>
            <FeatureCard
              icon={<Target className="h-10 w-10 text-primary" />}
              title="Dynamic Follow-ups"
              description="The AI asks relevant follow-up questions based on your previous answers."
            />
          </div>
          <div className={featuresSection.isVisible ? 'animate-slide-up animate-delay-400' : 'opacity-0'}>
            <FeatureCard
              icon={<TrendingUp className="h-10 w-10 text-primary" />}
              title="Performance Feedback"
              description="Detailed evaluation with strengths, weaknesses, and improvement suggestions."
            />
          </div>
          <div className={featuresSection.isVisible ? 'animate-slide-up animate-delay-500' : 'opacity-0'}>
            <FeatureCard
              icon={<CheckCircle className="h-10 w-10 text-primary" />}
              title="Multiple Interview Types"
              description="Practice HR, technical, behavioral, or mixed interviews at any difficulty."
            />
          </div>
          <div className={featuresSection.isVisible ? 'animate-slide-up animate-delay-700' : 'opacity-0'}>
            <FeatureCard
              icon={<Sparkles className="h-10 w-10 text-primary" />}
              title="Groq AI Engine"
              description="Lightning-fast responses powered by Groq's LPU™ inference technology with Llama 3.3."
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-20" ref={howItWorksSection.elementRef}>
        <div className="text-center mb-16">
          <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${howItWorksSection.isVisible ? 'animate-slide-up' : 'opacity-0'}`}>
            How It Works
          </h2>
          <p className={`text-muted-foreground text-lg ${howItWorksSection.isVisible ? 'animate-slide-up animate-delay-100' : 'opacity-0'}`}>
            Get started in minutes
          </p>
        </div>

        <div className={`grid md:grid-cols-5 gap-8 max-w-5xl mx-auto ${howItWorksSection.isVisible ? 'animate-fade-in animate-delay-200' : 'opacity-0'}`}>
          <Step number="1" title="Upload Resume" />
          <Step number="2" title="Add Job Details" />
          <Step number="3" title="Start Interview" />
          <Step number="4" title="Get Feedback" />
          <Step number="5" title="Practice Again" />
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20" ref={ctaSection.elementRef}>
        <div className={`bg-gradient-primary rounded-2xl p-12 text-center text-white ${ctaSection.isVisible ? 'animate-scale-in' : 'opacity-0 scale-95'}`}>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Ace Your Next Interview?
          </h2>
          <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
            Start practicing today with AI-powered interview simulation. No sign-up required.
          </p>
          <Link href="/interview/new">
            <Button size="lg" className="text-lg px-8 bg-white text-primary hover:bg-white/90 hover-lift">
              Start Your First Interview
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 mt-20">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2024 InterviewAI. Built with Next.js and Groq AI.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="p-6 rounded-lg border bg-card hover-lift transition-all">
      <div className="mb-4 text-primary">{icon}</div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  );
}

function Step({ number, title }: { number: string; title: string }) {
  return (
    <div className="flex flex-col items-center text-center hover-lift">
      <div className="w-12 h-12 rounded-full bg-gradient-primary text-primary-foreground flex items-center justify-center font-bold text-lg mb-3 animate-glow">
        {number}
      </div>
      <p className="font-medium">{title}</p>
    </div>
  );
}
