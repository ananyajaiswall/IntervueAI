import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import AppHeader from '@/components/AppHeader';
import { Camera, CameraOff, Mic, MicOff, X, Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { InterviewSelection } from '@/components/InterviewSelection';
import interviewService, { InterviewSession, InterviewResponse } from '@/lib/interviewService';
import sessionService from '@/lib/sessionService';
import { toast } from 'sonner';

const Simulation = () => {
  const navigate = useNavigate();
  const [showSelection, setShowSelection] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [interviewSession, setInterviewSession] = useState<InterviewSession | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<InterviewResponse[]>([]);
  
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [showGuideDialog, setShowGuideDialog] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Start timer
  useEffect(() => {
    if (!showSelection && interviewSession) {
      timerRef.current = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [showSelection, interviewSession]);

  // Request camera and microphone permissions
  const requestMediaPermissions = async () => {
    try {
      console.log('Requesting media permissions...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: true,
      });
      
      console.log('Stream obtained:', stream);
      mediaStreamRef.current = stream;
      
      if (videoRef.current) {
        console.log('Setting video srcObject...');
        videoRef.current.srcObject = stream;
        
        // Force video to be visible
        videoRef.current.style.display = 'block';
        
        // Set video attributes
        videoRef.current.setAttribute('autoplay', '');
        videoRef.current.setAttribute('playsinline', '');
        videoRef.current.muted = true;
        
        // Set camera state immediately
        setIsCameraOn(true);
        setIsMicOn(true);
        
        // Play video
        videoRef.current.onloadedmetadata = () => {
          console.log('Video metadata loaded');
          videoRef.current?.play()
            .then(() => console.log('Video playing'))
            .catch(e => console.error('Play error:', e));
        };
      }
      
      return true;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      toast.error('Failed to access camera/microphone. Please check permissions.');
      return false;
    }
  };

  // Stop media streams
  const stopMediaStreams = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Toggle camera
  const toggleCamera = () => {
    if (mediaStreamRef.current) {
      const videoTrack = mediaStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCameraOn(videoTrack.enabled);
      }
    }
  };

  // Toggle microphone
  const toggleMic = () => {
    if (mediaStreamRef.current) {
      const audioTrack = mediaStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicOn(audioTrack.enabled);
      }
    }
  };

  // Start recording
  const startRecording = () => {
    if (!mediaStreamRef.current) {
      toast.error('Media stream not available');
      return;
    }

    audioChunksRef.current = [];
    
    const mediaRecorder = new MediaRecorder(mediaStreamRef.current);
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
      await transcribeAndAnalyze(audioBlob);
    };

    mediaRecorder.start();
    setIsRecording(true);
    setCurrentTranscript('Recording your answer...');
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Handle Enter key press
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Enter' && isRecording && !isTranscribing) {
        stopRecording();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [isRecording, isTranscribing]);

  // Transcribe and analyze the recorded audio
  const transcribeAndAnalyze = async (audioBlob: Blob) => {
    if (!interviewSession) return;

    const currentQuestion = interviewSession.questions[currentQuestionIndex];
    setIsTranscribing(true);
    setCurrentTranscript('Transcribing your answer...');

    try {
      // Transcribe audio
      const transcription = await interviewService.transcribeAudio(audioBlob);
      setCurrentTranscript(transcription.transcription);

      // Store response
      const newResponse: InterviewResponse = {
        question_id: currentQuestion.question_id,
        question: currentQuestion.question,
        answer: transcription.transcription,
        transcription: transcription.transcription,
      };

      setResponses((prev) => [...prev, newResponse]);

      // Move to next question or finish
      setTimeout(() => {
        if (currentQuestionIndex < interviewSession.questions.length - 1) {
          setCurrentQuestionIndex((prev) => prev + 1);
          setCurrentTranscript('');
        } else {
          // All questions completed
          toast.success('Interview completed! Analyzing your responses...');
          setShowEndDialog(true);
        }
      }, 2000);
    } catch (error) {
      console.error('Error transcribing audio:', error);
      toast.error('Failed to transcribe audio. Please try again.');
      setCurrentTranscript('');
    } finally {
      setIsTranscribing(false);
    }
  };

  // Handle interview start
  const handleStartInterview = async (persona: string, difficulty: string) => {
    setIsLoading(true);
    
    try {
      // Request media permissions
      const hasPermissions = await requestMediaPermissions();
      if (!hasPermissions) {
        setIsLoading(false);
        return;
      }

      // Start interview session
      const session = await interviewService.startInterview({
        persona,
        difficulty,
        num_questions: 5,
      });

      // Create session in MongoDB
      const dbSession = await sessionService.createSession({
        persona,
        difficulty,
        questions: session.questions,
      });

      setInterviewSession(session);
      setSessionId(dbSession._id);
      setShowSelection(false);
      setShowGuideDialog(true);
      toast.success('Interview started! Answer each question when ready.');
    } catch (error) {
      console.error('Error starting interview:', error);
      toast.error('Failed to start interview. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle end interview
  const handleEndInterview = async () => {
    stopRecording();
    stopMediaStreams();
    
    // Save responses to localStorage for feedback page
    localStorage.setItem('interviewResponses', JSON.stringify(responses));
    localStorage.setItem('interviewSession', JSON.stringify(interviewSession));
    localStorage.setItem('sessionId', sessionId || '');
    localStorage.setItem('sessionDuration', elapsedTime.toString());
    
    // Update session in MongoDB as completed
    if (sessionId) {
      try {
        await sessionService.updateSession(sessionId, {
          responses,
          duration: elapsedTime,
          status: 'completed',
        });
      } catch (error) {
        console.error('Error updating session:', error);
      }
    }
    
    navigate('/feedback');
  };

  // Handle next question
  const handleNextQuestion = () => {
    stopRecording();
    
    setTimeout(() => {
      startRecording();
    }, 1000);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopMediaStreams();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Show selection screen
  if (showSelection) {
    return <InterviewSelection onStart={handleStartInterview} isLoading={isLoading} />;
  }

  if (!interviewSession) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const currentQuestion = interviewSession.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / interviewSession.questions.length) * 100;

  return (
    <div className="min-h-screen bg-background dark flex flex-col">
      <AppHeader />
      {/* Progress Bar */}
      <div className="w-full h-2 bg-muted">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Video Area */}
      <div className="flex-1 grid md:grid-cols-2 gap-4 p-4">
        {/* User Video Feed */}
        <div className="relative rounded-xl overflow-hidden border-2 border-primary shadow-lg bg-black" style={{ minHeight: '400px' }}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            style={{ 
              transform: 'scaleX(-1)',
              display: isCameraOn ? 'block' : 'none'
            }}
          />
          {!isCameraOn && (
            <div className="absolute inset-0 bg-muted flex items-center justify-center">
              <div className="text-center">
                <CameraOff className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Camera is off</p>
              </div>
            </div>
          )}
          <div className="absolute bottom-4 left-4 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-white">
            You
          </div>
          {isRecording && (
            <div className="absolute top-4 left-4 flex items-center gap-2 bg-destructive/80 backdrop-blur-sm px-3 py-1 rounded-full">
              <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
              <span className="text-white text-sm font-medium">Recording</span>
            </div>
          )}
        </div>

        {/* AI Interviewer & Question */}
        <div className="relative rounded-xl overflow-hidden border-2 border-secondary shadow-lg">
          <div className="h-full bg-gradient-to-br from-primary/10 to-secondary/10 flex flex-col items-center justify-center p-8">
            <div className="text-center mb-6">
              <div className="w-24 h-24 bg-primary rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-5xl">👨‍💼</span>
              </div>
              <p className="text-lg font-medium text-white">{interviewSession.persona}</p>
              <p className="text-sm text-white/80 capitalize">
                {interviewSession.difficulty} Level
              </p>
            </div>
            
            <div className="bg-card border rounded-lg p-6 max-w-md">
              <p className="text-sm text-muted-foreground mb-2">
                Question {currentQuestionIndex + 1} of {interviewSession.questions.length}
              </p>
              <p className="text-lg font-medium text-white">{currentQuestion.question}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Transcript Area */}
      <div className="px-4 pb-4">
        <div className="bg-card border rounded-lg p-4 max-h-32 overflow-y-auto">
          {isTranscribing ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-white" />
              <p className="text-sm text-white italic">{currentTranscript}</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              {currentTranscript || 'Your response will appear here...'}
            </p>
          )}
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-card border-t p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 px-4 py-2 rounded-lg">
              <span className="font-mono text-lg font-bold text-primary">
                {formatTime(elapsedTime)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-full"
              onClick={toggleCamera}
            >
              {isCameraOn ? (
                <Camera className="h-5 w-5" />
              ) : (
                <CameraOff className="h-5 w-5 text-destructive" />
              )}
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-full"
              onClick={toggleMic}
              disabled={isRecording}
            >
              {isMicOn ? (
                <Mic className="h-5 w-5" />
              ) : (
                <MicOff className="h-5 w-5 text-destructive" />
              )}
            </Button>

            {isRecording ? (
              <Button
                variant="default"
                size="lg"
                className="ml-4"
                onClick={stopRecording}
                disabled={isTranscribing}
              >
                {isTranscribing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Stop Recording'
                )}
              </Button>
            ) : (
              <>
                <Button
                  variant="default"
                  size="lg"
                  className="ml-4"
                  onClick={startRecording}
                  disabled={isTranscribing}
                >
                  Start Recording
                </Button>
                {currentTranscript && !isTranscribing && (
                  <Button
                    variant="default"
                    size="lg"
                    className="ml-4"
                    onClick={handleNextQuestion}
                    disabled={currentQuestionIndex >= interviewSession.questions.length - 1}
                  >
                    Next Question
                  </Button>
                )}
              </>
            )}

            <Button
              variant="destructive"
              size="lg"
              className="ml-4"
              onClick={() => setShowEndDialog(true)}
            >
              <X className="mr-2 h-5 w-5" />
              End Interview
            </Button>
          </div>

          <div className="w-32" /> {/* Spacer for centering */}
        </div>
      </div>

      {/* End Interview Dialog */}
      <AlertDialog open={showEndDialog} onOpenChange={setShowEndDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>End Interview?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to end this interview session? Your progress will be saved and
              you'll receive detailed feedback.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Interview</AlertDialogCancel>
            <AlertDialogAction onClick={handleEndInterview}>
              End & Get Feedback
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Welcome Guide Dialog */}
      <AlertDialog open={showGuideDialog} onOpenChange={setShowGuideDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>🎯 Welcome to Your Interview Simulation!</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p className="font-semibold text-foreground">Here's how it works:</p>
              
              <div className="space-y-2 text-left">
                <div className="flex items-start gap-2">
                  <span className="text-primary font-bold">1.</span>
                  <p>Read the question carefully from the AI interviewer.</p>
                </div>
                
                <div className="flex items-start gap-2">
                  <span className="text-primary font-bold">2.</span>
                  <p><strong>Click "Start Recording"</strong> when you're ready to answer the question.</p>
                </div>
                
                <div className="flex items-start gap-2">
                  <span className="text-primary font-bold">3.</span>
                  <p>Speak your answer clearly into your microphone.</p>
                </div>
                
                <div className="flex items-start gap-2">
                  <span className="text-primary font-bold">4.</span>
                  <p><strong>Click "Stop Recording"</strong> when you're done answering to move to the next question.</p>
                </div>
                
                <div className="flex items-start gap-2">
                  <span className="text-primary font-bold">5.</span>
                  <p>Repeat for all {interviewSession?.questions.length || 5} questions.</p>
                </div>
              </div>

              <div className="mt-4 p-3 bg-primary/10 rounded-lg">
                <p className="text-sm">
                  <strong>💡 Tip:</strong> Take your time to think before recording. You can toggle your camera and microphone using the controls at the bottom.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowGuideDialog(false)}>
              Got it! Let's Start
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Simulation;
