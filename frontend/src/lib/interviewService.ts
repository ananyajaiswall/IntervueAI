import api from './api';

export interface InterviewConfig {
  persona: string;
  difficulty: string;
  num_questions?: number;
}

export interface Question {
  question_id: number;
  question: string;
}

export interface InterviewSession {
  session_id: string;
  persona: string;
  difficulty: string;
  questions: Question[];
}

export interface TranscriptionResponse {
  transcription: string;
  language: string;
}

export interface AnalysisResponse {
  analysis: string;
  improved_answer: string;
}

export interface InterviewResponse {
  question_id: number;
  question: string;
  answer: string;
  transcription?: string;
  analysis?: AnalysisResponse;
}

class InterviewService {
  // Start a new interview session
  async startInterview(config: InterviewConfig): Promise<InterviewSession> {
    const response = await api.post('/interview/start', config);
    return response.data;
  }

  // Transcribe audio to text
  async transcribeAudio(audioBlob: Blob): Promise<TranscriptionResponse> {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'audio.wav');

    const response = await api.post('/interview/transcribe', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Analyze answer and get feedback
  async analyzeAnswer(
    question: string,
    answer: string,
    persona: string
  ): Promise<AnalysisResponse> {
    const response = await api.post('/interview/analyze', {
      question,
      answer,
      persona,
    });
    return response.data;
  }
}

export const interviewService = new InterviewService();
export default interviewService;
