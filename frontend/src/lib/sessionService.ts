import api from './api';

export interface SessionData {
  _id?: string;
  persona: string;
  difficulty: string;
  questions?: any[];
  responses?: any[];
  score?: number;
  communicationScore?: number;
  confidenceScore?: number;
  duration?: number;
  status?: 'in_progress' | 'completed' | 'abandoned';
  createdAt?: string;
}

const sessionService = {
  // Create a new interview session
  createSession: async (data: { persona: string; difficulty: string; questions: any[] }) => {
    const response = await api.post('/sessions', data);
    return response.data.data;
  },

  // Update session with responses and feedback
  updateSession: async (
    sessionId: string,
    data: {
      responses?: any[];
      score?: number;
      communicationScore?: number;
      confidenceScore?: number;
      duration?: number;
      status?: 'in_progress' | 'completed' | 'abandoned';
    }
  ) => {
    const response = await api.put(`/sessions/${sessionId}`, data);
    return response.data.data;
  },

  // Get all completed sessions for the user
  getSessions: async () => {
    const response = await api.get('/sessions');
    return response.data.data;
  },

  // Get a specific session by ID
  getSession: async (sessionId: string) => {
    const response = await api.get(`/sessions/${sessionId}`);
    return response.data.data;
  },

  // Get session count
  getSessionCount: async () => {
    const response = await api.get('/sessions/stats/count');
    return response.data.data.totalSessions;
  },

  // Get session stats including averages
  getSessionStats: async () => {
    const response = await api.get('/sessions/stats/count');
    return response.data.data;
  },
};

export default sessionService;
