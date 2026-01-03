import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Play, TrendingUp, Brain, Target } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light via-background to-secondary-light">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            IntervueAI
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Master your interview skills with hyper-realistic AI coaching. Practice with confidence, get instant
            feedback, and land your dream job.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="text-lg bg-accent hover:bg-accent-hover text-accent-foreground"
              onClick={() => navigate("/auth")}
            >
              <Play className="mr-2 h-5 w-5" />
              Get Started Free
            </Button>
            <Button size="lg" variant="outline" className="text-lg" onClick={() => navigate("/auth")}>
              Sign In
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-card rounded-xl p-6 shadow-lg border">
            <div className="h-12 w-12 rounded-lg bg-primary-light flex items-center justify-center mb-4">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">AI-Powered Feedback</h3>
            <p className="text-muted-foreground">
              Get detailed analysis of your performance including body language, communication style, and answer quality.
            </p>
          </div>

          <div className="bg-card rounded-xl p-6 shadow-lg border">
            <div className="h-12 w-12 rounded-lg bg-secondary-light flex items-center justify-center mb-4">
              <Target className="h-6 w-6 text-secondary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Realistic Scenarios</h3>
            <p className="text-muted-foreground">
              Practice with diverse interviewer personas and difficulty levels that match real-world interview situations.
            </p>
          </div>

          <div className="bg-card rounded-xl p-6 shadow-lg border">
            <div className="h-12 w-12 rounded-lg bg-accent-light flex items-center justify-center mb-4">
              <TrendingUp className="h-6 w-6 text-accent" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Track Progress</h3>
            <p className="text-muted-foreground">
              Monitor your improvement over time with detailed metrics and performance analytics.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
