import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Eye, MessageSquare, TrendingUp, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Feedback = () => {
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const [isImproving, setIsImproving] = useState(false);
  const [improvedAnswer, setImprovedAnswer] = useState("");

  const originalAnswer = `Um, so I've been working in software development for about 3 years now. I started as a junior developer and, like, learned a lot about React and Node.js. I think I'm pretty good at building web applications and stuff. I want to work here because, you know, I heard good things about the company.`;

  const handleImproveAnswer = () => {
    setIsImproving(true);
    // Simulate API call
    setTimeout(() => {
      setImprovedAnswer(`**Situation:** I began my career as a junior software developer three years ago at TechCorp, where I was responsible for maintaining and enhancing our customer-facing web applications.

**Task:** My primary responsibility was to modernize our legacy codebase by transitioning from jQuery to React, while ensuring zero downtime and maintaining all existing functionality.

**Action:** I systematically analyzed the existing codebase, created a comprehensive migration plan, and implemented components incrementally. I also conducted knowledge-sharing sessions with my team to ensure everyone was comfortable with the new technology stack.

**Result:** Successfully migrated 15 major features to React over 6 months, resulting in a 40% improvement in page load times and a 25% reduction in bug reports. This experience solidified my expertise in React and modern JavaScript frameworks, which directly aligns with the technical requirements for this position at your organization.`);
      setIsImproving(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold">Interview Feedback & Analysis</h1>
          <p className="text-muted-foreground">Session ID: {sessionId}</p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Column - Replay & Metrics */}
          <div className="space-y-6">
            {/* Video Player */}
            <Card>
              <CardHeader>
                <CardTitle>Session Replay</CardTitle>
                <CardDescription>Review your interview performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-4">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-primary-light rounded-full mx-auto mb-4 flex items-center justify-center">
                      <span className="text-4xl">▶️</span>
                    </div>
                    <p className="text-muted-foreground">Video replay placeholder</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Metrics Grid */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>Detailed breakdown of your interview performance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Eye Contact */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-success" />
                      <span className="font-medium">Eye Contact</span>
                    </div>
                    <span className="text-2xl font-bold text-success">87%</span>
                  </div>
                  <Progress value={87} className="h-2" />
                  <p className="text-xs text-muted-foreground">Excellent - Maintained strong eye contact throughout</p>
                </div>

                {/* Filler Words */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-warning" />
                      <span className="font-medium">Filler Words</span>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="mr-2">12 um's</Badge>
                      <Badge variant="outline">5 like's</Badge>
                    </div>
                  </div>
                  <Progress value={65} className="h-2 bg-warning-light" />
                  <p className="text-xs text-muted-foreground">Moderate usage - Try to reduce filler words</p>
                </div>

                {/* Posture */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-success" />
                      <span className="font-medium">Posture</span>
                    </div>
                    <Badge className="bg-success">Good</Badge>
                  </div>
                  <Progress value={85} className="h-2" />
                  <p className="text-xs text-muted-foreground">Maintained professional posture</p>
                </div>

                {/* Speaking Pace */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-primary" />
                      <span className="font-medium">Speaking Pace</span>
                    </div>
                    <span className="text-sm font-medium">145 WPM</span>
                  </div>
                  <Progress value={75} className="h-2" />
                  <p className="text-xs text-muted-foreground">Optimal pace for clarity and engagement</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - AI Analysis */}
          <div className="space-y-6">
            {/* AI Feedback Summary */}
            <Card>
              <CardHeader>
                <CardTitle>AI Feedback Summary</CardTitle>
                <CardDescription>Personalized insights from your interview</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-primary-light rounded-lg border-l-4 border-primary">
                  <h4 className="font-semibold mb-2 text-primary">Strengths</h4>
                  <p className="text-sm">
                    You demonstrated excellent technical knowledge and maintained strong eye contact throughout the
                    interview. Your enthusiasm for the role was evident and your body language conveyed confidence.
                  </p>
                </div>
                <div className="p-4 bg-warning-light rounded-lg border-l-4 border-warning">
                  <h4 className="font-semibold mb-2 text-warning">Areas for Improvement</h4>
                  <p className="text-sm">
                    Consider reducing filler words like "um" and "like" to sound more polished. Structure your answers
                    using the STAR method (Situation, Task, Action, Result) to provide more comprehensive responses.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Answer Improver */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-accent" />
                  Answer Improver
                </CardTitle>
                <CardDescription>Let AI help you craft better responses</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2 text-sm text-muted-foreground">Your Original Answer:</h4>
                  <div className="p-4 bg-muted rounded-lg text-sm">
                    <p className="italic">{originalAnswer}</p>
                  </div>
                </div>

                {!improvedAnswer && (
                  <Button
                    className="w-full bg-accent hover:bg-accent-hover text-accent-foreground"
                    size="lg"
                    onClick={handleImproveAnswer}
                    disabled={isImproving}
                  >
                    <Sparkles className="mr-2 h-5 w-5" />
                    {isImproving ? "Analyzing..." : "✨ Improve with AI"}
                  </Button>
                )}

                {improvedAnswer && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-muted-foreground">AI-Enhanced STAR Format:</h4>
                    <div className="p-4 bg-success-light border-l-4 border-success rounded-lg">
                      <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                        {improvedAnswer}
                      </div>
                    </div>
                    <Button variant="outline" className="w-full" onClick={() => setImprovedAnswer("")}>
                      Try Another Answer
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feedback;
