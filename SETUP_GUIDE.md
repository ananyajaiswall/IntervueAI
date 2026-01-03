# IntervueAI - Complete Setup Guide

This guide will help you set up the complete IntervueAI system with Python AI backend, Node.js API server, and React frontend.

## Prerequisites

- Node.js (v18 or higher)
- Python 3.8+
- Ollama (for AI analysis)
- MongoDB (running locally or cloud)

## Installation Steps

### 1. Install Ollama and Pull Model

```powershell
# Ollama should already be installed
ollama pull llama3
```

### 2. Install Python Dependencies

```powershell
cd backend
pip install -r requirements.txt
```

### 3. Install Node.js Dependencies

```powershell
cd backend
npm install

cd ../frontend
npm install
```

### 4. Configure Environment Variables

#### Backend (.env)
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
PYTHON_API_URL=http://localhost:8000
```

#### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

## Running the Application

You need to run **THREE** servers simultaneously:

### Terminal 1: Python FastAPI Server (Port 8000)
```powershell
cd backend
python interview_api.py
```

### Terminal 2: Node.js Backend (Port 5000)
```powershell
cd backend
npm run dev
```

### Terminal 3: React Frontend (Port 5173)
```powershell
cd frontend
npm run dev
```

### Terminal 4: Ollama Service (Port 11434)
```powershell
ollama serve
```

## System Architecture

```
┌─────────────┐
│   Frontend  │ (React + Vite)
│  Port 5173  │
└──────┬──────┘
       │
       ↓ HTTP Requests
┌──────────────┐
│   Node.js    │ (Express API)
│  Backend     │
│  Port 5000   │
└──────┬───────┘
       │
       ↓ Proxy Requests
┌──────────────┐
│   Python     │ (FastAPI)
│  Interview   │
│   Coach      │
│  Port 8000   │
└──────┬───────┘
       │
       ↓ AI Analysis
┌──────────────┐
│   Ollama     │ (LLaMA 3)
│  Port 11434  │
└──────────────┘
```

## Features

### Interview Configuration
- **Personas**: HR, Technical Lead, Senior Manager, Executive/CEO
- **Difficulty Levels**: Easy, Medium, Hard
- **Questions**: 5 questions per session (customizable)

### During Interview
- ✅ Real-time camera and microphone access
- ✅ Automatic audio recording for each question
- ✅ Speech-to-text transcription using Whisper
- ✅ Progress tracking with question counter
- ✅ Camera/microphone toggle controls

### After Interview
- ✅ AI-powered feedback analysis
- ✅ STAR-formatted answer improvements
- ✅ Strengths and areas for improvement
- ✅ Downloadable feedback report
- ✅ Question-by-question review

## API Endpoints

### Interview API

#### Start Interview
```
POST /api/interview/start
Body: {
  "persona": "HR",
  "difficulty": "medium",
  "num_questions": 5
}
```

#### Transcribe Audio
```
POST /api/interview/transcribe
Content-Type: multipart/form-data
Body: audio file
```

#### Analyze Answer
```
POST /api/interview/analyze
Body: {
  "question": "...",
  "answer": "...",
  "persona": "HR"
}
```

## Troubleshooting

### Ollama Connection Error
- Ensure Ollama is running: `ollama serve`
- Check if llama3 model is installed: `ollama list`

### Python Whisper Model Loading
- First run takes 1-2 minutes to download the model
- Model is cached for subsequent runs

### Camera/Microphone Permissions
- Browser must be served over HTTPS or localhost
- Check browser permissions in settings
- Allow camera and microphone access when prompted

### CORS Issues
- Ensure all servers are running on correct ports
- Check CORS configuration in backend servers

## Development Tips

### Hot Reload
- Frontend: Automatic with Vite
- Node Backend: Uses nodemon for auto-restart
- Python Backend: Restart manually or use `uvicorn --reload`

### Debugging
- Check browser console for frontend errors
- Check terminal output for backend errors
- Use browser DevTools Network tab for API debugging

## Production Deployment

For production deployment:
1. Set environment variables properly
2. Use production-grade WSGI server for Python (gunicorn)
3. Use PM2 or similar for Node.js
4. Build frontend: `npm run build`
5. Serve frontend with nginx or similar
6. Ensure Ollama runs as a service

## Support

For issues or questions, check:
- MongoDB connection string
- Python dependencies installed
- Ollama service running
- All environment variables set correctly
