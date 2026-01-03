import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Play, TrendingUp, MessageSquare, Clock, User, Settings, LogOut } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import sessionService from "@/lib/sessionService";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Dashboard = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("User");
  const [userInitials, setUserInitials] = useState("U");
  const [recentInterviews, setRecentInterviews] = useState<any[]>([]);
  const [totalSessions, setTotalSessions] = useState(0);
  const [avgCommunication, setAvgCommunication] = useState(0);
  const [avgConfidence, setAvgConfidence] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get user info from localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserName(user.name || "User");
        // Get initials from name
        const names = (user.name || "U").split(' ');
        const initials = names.length > 1 
          ? names[0][0] + names[names.length - 1][0]
          : names[0][0];
        setUserInitials(initials.toUpperCase());
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
    
    // Fetch interview sessions
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setIsLoading(true);
      const [sessions, stats] = await Promise.all([
        sessionService.getSessions(),
        sessionService.getSessionStats(),
      ]);
      setRecentInterviews(sessions);
      setTotalSessions(stats.totalSessions);
      setAvgCommunication(stats.avgCommunication || 0);
      setAvgConfidence(stats.avgConfidence || 0);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 
              className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => navigate("/")}
            >
              IntervueAI
            </h1>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar>
                    <AvatarFallback className="bg-primary text-primary-foreground">{userInitials}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{userName}</p>
                    <p className="text-xs leading-none text-muted-foreground">My Account</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/settings")}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/auth")}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome back, {userName}!</h2>
          <p className="text-muted-foreground">Ready to practice your interview skills today?</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          {/* Hero CTA Card */}
          <Card className="md:col-span-2 lg:col-span-3 overflow-hidden relative">
            <div
              className="absolute inset-0 opacity-10"
              style={{
                background: "var(--gradient-hero)",
              }}
            />
            <CardHeader className="relative">
              <CardTitle className="text-2xl">Ready for your next interview?</CardTitle>
              <CardDescription>Click below to begin your personalized AI interview session</CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <Button
                size="lg"
                className="w-full bg-accent hover:bg-accent-hover text-accent-foreground"
                onClick={() => navigate("/simulation")}
              >
                <Play className="mr-2 h-5 w-5" />
                Start Interview
              </Button>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Confidence</CardTitle>
              <TrendingUp className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-success">{avgConfidence}%</div>
              <p className="text-xs text-muted-foreground mt-1">Based on your interviews</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Communication</CardTitle>
              <MessageSquare className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{avgCommunication}%</div>
              <p className="text-xs text-muted-foreground mt-1">Based on your interviews</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Interviews</CardTitle>
              <Clock className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-secondary">{totalSessions}</div>
              <p className="text-xs text-muted-foreground mt-1">Total completed</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Interviews */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Interviews</CardTitle>
            <CardDescription>Your practice session history</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Clock className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : recentInterviews.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No completed interviews yet. Start your first interview to see your progress!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentInterviews.map((interview) => (
                  <div
                    key={interview._id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => navigate('/feedback', { state: { sessionId: interview._id } })}
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary-light flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{interview.persona}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(interview.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-lg font-bold">{interview.score || 0}/100</p>
                        <p className="text-xs text-muted-foreground">Overall Score</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
