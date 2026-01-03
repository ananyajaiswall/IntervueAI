import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate, useLocation } from 'react-router-dom';
import AppHeader from '@/components/AppHeader';
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Loader2,
  Download,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import interviewService, { InterviewSession, InterviewResponse } from '@/lib/interviewService';
import sessionService from '@/lib/sessionService';
import { calculateOverallScores } from '@/lib/scoreCalculator';
import { toast } from 'sonner';
import jsPDF from 'jspdf';

interface AnalyzedResponse extends InterviewResponse {
  analysis?: {
    analysis: string;
    improved_answer: string;
  };
}

const Feedback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [responses, setResponses] = useState<AnalyzedResponse[]>([]);
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [currentTab, setCurrentTab] = useState('0');

  useEffect(() => {
    loadAndAnalyzeResponses();
  }, []);

  const loadAndAnalyzeResponses = async () => {
    try {
      // Check if we're loading from a previous session (from Dashboard)
      const sessionId = (location.state as any)?.sessionId;
      
      if (sessionId) {
        // Load session data from backend
        setIsAnalyzing(true);
        const sessionData = await sessionService.getSession(sessionId);
        
        if (!sessionData || !sessionData.responses || sessionData.responses.length === 0) {
          toast.error('No interview data found for this session');
          navigate('/dashboard');
          return;
        }
        
        // Map session data to the expected format
        const sessionObj: InterviewSession = {
          session_id: sessionData._id || '',
          persona: sessionData.persona,
          difficulty: sessionData.difficulty,
          questions: sessionData.questions || [],
        };
        
        setSession(sessionObj);
        setResponses(sessionData.responses as AnalyzedResponse[]);
        setIsAnalyzing(false);
        return;
      }
      
      // Otherwise, load from localStorage (for just-completed interviews)
      const storedResponses = localStorage.getItem('interviewResponses');
      const storedSession = localStorage.getItem('interviewSession');

      if (!storedResponses || !storedSession) {
        toast.error('No interview data found');
        navigate('/simulation');
        return;
      }

      const parsedResponses: InterviewResponse[] = JSON.parse(storedResponses);
      const parsedSession: InterviewSession = JSON.parse(storedSession);

      // Validate we have responses
      if (!parsedResponses || parsedResponses.length === 0) {
        toast.error('No responses to analyze');
        navigate('/simulation');
        return;
      }

      setSession(parsedSession);
      setResponses(parsedResponses);

      // Analyze each response
      setIsAnalyzing(true);
      const analyzedResponses: AnalyzedResponse[] = [];

      for (const response of parsedResponses) {
        try {
          // Only analyze if we have an answer
          if (response.answer && response.answer.trim()) {
            const analysis = await interviewService.analyzeAnswer(
              response.question,
              response.answer,
              parsedSession.persona
            );

            analyzedResponses.push({
              ...response,
              analysis,
            });
          } else {
            // No answer provided
            analyzedResponses.push({
              ...response,
              analysis: {
                analysis: 'No answer was provided for this question.',
                improved_answer: 'Please record an answer to receive feedback.',
              },
            });
          }
        } catch (error) {
          console.error('Error analyzing response:', error);
          toast.error(`Failed to analyze question ${response.question_id}`);
          analyzedResponses.push({
            ...response,
            analysis: {
              analysis: 'Analysis failed. Please try again later.',
              improved_answer: 'Unable to generate improved answer.',
            },
          });
        }
      }

      setResponses(analyzedResponses);
      setIsAnalyzing(false);
      toast.success(`Analysis complete for ${analyzedResponses.length} response(s)!`);
      
      // Save analyzed responses to MongoDB
      const storedSessionId = localStorage.getItem('sessionId');
      if (storedSessionId) {
        try {
          // Calculate scores using the score calculator
          const scores = calculateOverallScores(analyzedResponses);
          
          await sessionService.updateSession(storedSessionId, {
            responses: analyzedResponses,
            score: scores.overallScore,
            communicationScore: scores.communicationScore,
            confidenceScore: scores.confidenceScore,
            status: 'completed',
          });
        } catch (error) {
          console.error('Error saving feedback to database:', error);
        }
      }
    } catch (error) {
      console.error('Error loading responses:', error);
      toast.error('Failed to load interview data');
      setIsAnalyzing(false);
    }
  };

  const handleDownloadReport = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - (2 * margin);
    let yPosition = margin;

    // Helper function to add text with word wrap
    const addText = (text: string, fontSize: number = 10, isBold: boolean = false) => {
      doc.setFontSize(fontSize);
      doc.setFont('helvetica', isBold ? 'bold' : 'normal');
      const lines = doc.splitTextToSize(text, maxWidth);
      
      lines.forEach((line: string) => {
        if (yPosition > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
        }
        doc.text(line, margin, yPosition);
        yPosition += fontSize * 0.5;
      });
    };

    // Title
    doc.setFillColor(59, 130, 246);
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('INTERVIEW FEEDBACK REPORT', pageWidth / 2, 25, { align: 'center' });
    
    yPosition = 50;
    doc.setTextColor(0, 0, 0);

    // Interview Details
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Interview Details', margin, yPosition);
    yPosition += 8;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Persona: ${session?.persona}`, margin, yPosition);
    yPosition += 6;
    doc.text(`Difficulty: ${session?.difficulty}`, margin, yPosition);
    yPosition += 6;
    doc.text(`Total Questions: ${responses.length}`, margin, yPosition);
    yPosition += 6;
    doc.text(`Date: ${new Date().toLocaleDateString()}`, margin, yPosition);
    yPosition += 15;

    // Questions and Answers
    responses.forEach((response, index) => {
      // Check if we need a new page
      if (yPosition > pageHeight - 80) {
        doc.addPage();
        yPosition = margin;
      }

      // Question Header
      doc.setFillColor(240, 240, 240);
      doc.rect(margin - 5, yPosition - 5, maxWidth + 10, 12, 'F');
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(59, 130, 246);
      doc.text(`Question ${index + 1}`, margin, yPosition + 3);
      yPosition += 15;

      // Question Text
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      const questionLines = doc.splitTextToSize(response.question, maxWidth);
      questionLines.forEach((line: string) => {
        if (yPosition > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
        }
        doc.text(line, margin, yPosition);
        yPosition += 5;
      });
      yPosition += 5;

      // Your Answer
      doc.setFont('helvetica', 'bold');
      doc.text('Your Answer:', margin, yPosition);
      yPosition += 6;
      doc.setFont('helvetica', 'normal');
      const answerLines = doc.splitTextToSize(response.answer || 'No answer provided', maxWidth - 5);
      answerLines.forEach((line: string) => {
        if (yPosition > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
        }
        doc.text(line, margin + 5, yPosition);
        yPosition += 5;
      });
      yPosition += 8;

      if (response.analysis) {
        // Feedback
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(234, 88, 12);
        doc.text('Feedback:', margin, yPosition);
        yPosition += 6;
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
        
        const feedbackText = response.analysis.analysis.replace(/\*\*/g, '').replace(/<[^>]*>/g, '');
        const feedbackLines = doc.splitTextToSize(feedbackText, maxWidth - 5);
        feedbackLines.forEach((line: string) => {
          if (yPosition > pageHeight - margin) {
            doc.addPage();
            yPosition = margin;
          }
          doc.text(line, margin + 5, yPosition);
          yPosition += 5;
        });
        yPosition += 8;

        // Improved Answer
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(34, 197, 94);
        doc.text('Improved Answer:', margin, yPosition);
        yPosition += 6;
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
        
        const improvedText = response.analysis.improved_answer.replace(/\*\*/g, '').replace(/<[^>]*>/g, '');
        const improvedLines = doc.splitTextToSize(improvedText, maxWidth - 5);
        improvedLines.forEach((line: string) => {
          if (yPosition > pageHeight - margin) {
            doc.addPage();
            yPosition = margin;
          }
          doc.text(line, margin + 5, yPosition);
          yPosition += 5;
        });
        yPosition += 10;
      }

      // Separator line
      if (index < responses.length - 1) {
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 15;
      }
    });

    // Save PDF
    doc.save(`interview-feedback-${Date.now()}.pdf`);
    toast.success('PDF report downloaded!');
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-2">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
              <h1 className="text-2xl font-bold">Interview Feedback & Analysis</h1>
              <p className="text-muted-foreground">
                {session.persona} Interview · {session.difficulty} Level
              </p>
            </div>
            <Button onClick={handleDownloadReport}>
              <Download className="mr-2 h-4 w-4" />
              Download Report
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {isAnalyzing ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
                <h3 className="text-lg font-semibold mb-2">Analyzing Your Responses</h3>
                <p className="text-muted-foreground">
                  Our AI is reviewing your answers and generating detailed feedback...
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Questions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{responses.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Persona
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{session.persona}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Difficulty
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant="secondary" className="text-lg capitalize">
                    {session.difficulty}
                  </Badge>
                </CardContent>
              </Card>
            </div>

            {/* Questions & Feedback */}
            <Card>
              <CardHeader>
                <CardTitle>Detailed Feedback</CardTitle>
                <CardDescription>
                  Review your answers with AI-powered analysis and improvements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={currentTab} onValueChange={setCurrentTab}>
                  <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${Math.min(responses.length, 5)}, minmax(0, 1fr))` }}>
                    {responses.map((_, index) => (
                      <TabsTrigger key={index} value={index.toString()}>
                        Q{index + 1}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {responses.map((response, index) => (
                    <TabsContent key={index} value={index.toString()} className="space-y-6">
                      {/* Question */}
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">
                          Question {index + 1}
                        </h3>
                        <p className="text-lg font-medium">{response.question}</p>
                      </div>

                      <Separator />

                      {/* Your Answer */}
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">
                          Your Answer
                        </h3>
                        <div className="bg-muted rounded-lg p-4">
                          <p className="text-sm whitespace-pre-wrap">{response.answer}</p>
                        </div>
                      </div>

                      {response.analysis ? (
                        <>
                          <Separator />

                          {/* Analysis */}
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <AlertCircle className="h-5 w-5 text-primary" />
                              <h3 className="text-lg font-semibold">Feedback & Analysis</h3>
                            </div>
                            <div className="prose prose-sm max-w-none">
                              <div
                                className="space-y-2"
                                dangerouslySetInnerHTML={{
                                  __html: response.analysis.analysis
                                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                    .replace(/\n/g, '<br />'),
                                }}
                              />
                            </div>
                          </div>

                          <Separator />

                          {/* Improved Answer */}
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <Sparkles className="h-5 w-5 text-primary" />
                              <h3 className="text-lg font-semibold">AI-Improved Answer (STAR Format)</h3>
                            </div>
                            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                              <div
                                className="prose prose-sm max-w-none"
                                dangerouslySetInnerHTML={{
                                  __html: response.analysis.improved_answer
                                    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-primary">$1</strong>')
                                    .replace(/\n\n/g, '<br /><br />'),
                                }}
                              />
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-8">
                          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                          <p className="text-muted-foreground">
                            Analysis not available for this response
                          </p>
                        </div>
                      )}

                      {/* Navigation */}
                      <div className="flex justify-between pt-4">
                        <Button
                          variant="outline"
                          onClick={() => setCurrentTab((index - 1).toString())}
                          disabled={index === 0}
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setCurrentTab((index + 1).toString())}
                          disabled={index === responses.length - 1}
                        >
                          Next
                        </Button>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4 mt-8">
              <Button size="lg" onClick={() => navigate('/simulation')}>
                Practice Again
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/dashboard')}>
                Go to Dashboard
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Feedback;
