# ✅ Integration Checklist

## Pre-Flight Checklist - Before First Run

### System Requirements
- [ ] Node.js v18+ installed
- [ ] Python 3.8+ installed
- [ ] Ollama installed
- [ ] MongoDB running (local or cloud)
- [ ] Chrome/Edge/Firefox browser

### Installation
- [ ] Ollama llama3 model pulled: `ollama pull llama3`
- [ ] Backend Node packages installed: `cd backend && npm install`
- [ ] Backend Python packages installed: `cd backend && pip install -r requirements.txt`
- [ ] Frontend packages installed: `cd frontend && npm install`

### Configuration
- [ ] Backend `.env` file created (copy from `.env.example`)
- [ ] MongoDB URI configured in backend `.env`
- [ ] JWT secret set in backend `.env`
- [ ] Frontend `.env` file created (if needed)

## Startup Checklist

### Option 1: Automated Startup
- [ ] Run `.\start-all.ps1` from project root
- [ ] Wait for all 4 terminals to open
- [ ] Check each terminal for "Server running" messages

### Option 2: Manual Startup
- [ ] Terminal 1: `ollama serve` (should show "Listening on 127.0.0.1:11434")
- [ ] Terminal 2: `cd backend && python interview_api.py` (wait for "Listening on 0.0.0.0:8000")
- [ ] Terminal 3: `cd backend && npm run dev` (wait for "Server running on port 5000")
- [ ] Terminal 4: `cd frontend && npm run dev` (should show "Local: http://localhost:5173")

## Service Verification

### Check Each Service is Running
- [ ] Ollama: Open http://localhost:11434 (should see "Ollama is running")
- [ ] Python API: Open http://localhost:8000 (should see {"message":"Interview Coach API"})
- [ ] Node Backend: Open http://localhost:5000/api/health (should see success message)
- [ ] Frontend: Open http://localhost:5173 (should see the app)

## Feature Testing

### Test Basic Flow
- [ ] Open http://localhost:5173
- [ ] Login/Register if needed
- [ ] Navigate to "Start Interview" or "Simulation" page
- [ ] Can see persona selection screen
- [ ] Select a persona (e.g., HR)
- [ ] Select difficulty (e.g., Medium)
- [ ] Click "Start Interview"

### Test Media Permissions
- [ ] Browser prompts for camera permission
- [ ] Browser prompts for microphone permission
- [ ] Grant both permissions
- [ ] Can see video preview in the interface
- [ ] Recording indicator appears

### Test Interview Flow
- [ ] First question appears on screen
- [ ] Recording starts automatically
- [ ] Can speak and see "Recording..." indicator
- [ ] Click "Stop Recording"
- [ ] Transcription appears (may take 2-5 seconds)
- [ ] Can click "Next Question"
- [ ] Process repeats for all questions
- [ ] Can end interview early if needed

### Test Feedback Page
- [ ] After completing interview, redirected to feedback page
- [ ] See "Analyzing responses..." loading state
- [ ] Analysis completes (may take 1-2 minutes for all questions)
- [ ] Can see each question in tabs
- [ ] Can see original answer for each question
- [ ] Can see AI feedback (Strengths & Improvements)
- [ ] Can see improved STAR-formatted answer
- [ ] Can navigate between questions
- [ ] Can download report

## Troubleshooting Checklist

### If Ollama Fails
- [ ] Check if Ollama is installed: `ollama --version`
- [ ] Check if llama3 is available: `ollama list`
- [ ] Try starting manually: `ollama serve`
- [ ] Try pulling model again: `ollama pull llama3`

### If Python API Fails
- [ ] Check Python version: `python --version` (should be 3.8+)
- [ ] Check dependencies: `pip list` (look for fastapi, uvicorn, whisper)
- [ ] Check for port conflicts (port 8000)
- [ ] Review error messages in terminal

### If Node Backend Fails
- [ ] Check Node version: `node --version` (should be v18+)
- [ ] Check MongoDB connection
- [ ] Review `.env` file configuration
- [ ] Check for port conflicts (port 5000)
- [ ] Run `npm install` again if needed

### If Frontend Fails
- [ ] Check Node version: `node --version`
- [ ] Run `npm install` in frontend folder
- [ ] Check for port conflicts (port 5173)
- [ ] Clear browser cache
- [ ] Check browser console for errors

### If Camera/Microphone Fails
- [ ] Check browser is Chrome, Edge, or Firefox
- [ ] Check browser permissions (Settings → Privacy → Camera/Microphone)
- [ ] Make sure page is served over localhost or HTTPS
- [ ] Close other apps using camera/microphone
- [ ] Restart browser

### If Transcription Fails
- [ ] Check Whisper model loaded (see Python terminal)
- [ ] Check audio file size (should be > 0 bytes)
- [ ] Try recording again with clearer audio
- [ ] Check Python terminal for errors

### If Analysis Fails
- [ ] Check Ollama is running: http://localhost:11434
- [ ] Check llama3 model loaded: `ollama list`
- [ ] Check Node backend logs for errors
- [ ] Check Python API logs for errors
- [ ] Verify CORS settings

## Performance Checklist

### First Run (Expected Delays)
- [ ] Whisper model download: 1-2 minutes (one-time)
- [ ] LLaMA 3 model loading: 30-60 seconds (one-time)

### Normal Operation
- [ ] Question generation: < 1 second
- [ ] Audio transcription: 2-5 seconds per answer
- [ ] AI analysis: 10-15 seconds per answer
- [ ] Total interview: 15-20 minutes (5 questions)

## Success Criteria

### You've successfully integrated the system if:
- [x] All 4 services start without errors
- [x] Can access frontend at http://localhost:5173
- [x] Can select persona and difficulty
- [x] Camera and microphone permissions granted
- [x] Can record audio for each question
- [x] Transcription works
- [x] AI analysis completes
- [x] Feedback displays correctly
- [x] Can download report

## Next Steps After Integration

### For Development
- [ ] Set up proper environment variables for production
- [ ] Configure production MongoDB instance
- [ ] Set up proper CORS for production domain
- [ ] Implement user authentication (if not already done)
- [ ] Add error logging and monitoring
- [ ] Implement rate limiting
- [ ] Add analytics

### For Users
- [ ] Create user documentation
- [ ] Record demo video
- [ ] Create FAQ section
- [ ] Set up user feedback mechanism

## Notes

- Keep all 4 terminals open while using the app
- First-time model downloads may take several minutes
- Ensure good internet connection for model downloads
- Use headphones to prevent audio feedback
- Speak clearly and at normal volume for best transcription

---

**All checkboxes checked? You're ready to go! 🚀**
