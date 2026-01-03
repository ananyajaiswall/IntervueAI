# 🚀 Quick Start Guide - IntervueAI

## One-Command Startup

Run this command to start all services at once:

```powershell
.\start-all.ps1
```

This will automatically open 4 PowerShell windows:
1. **Ollama Service** (AI Model)
2. **Python FastAPI** (Interview Coach API)
3. **Node.js Backend** (Main API Server)
4. **React Frontend** (User Interface)

## Access the Application

Open your browser and navigate to:
```
http://localhost:5173
```

## Using the Application

### 1. Start Interview
- Click "Start Interview" button
- Select Interview Persona (HR, Technical Lead, etc.)
- Choose Difficulty Level (Easy, Medium, Hard)
- Click "Start Interview"

### 2. Grant Permissions
- Allow camera access when prompted
- Allow microphone access when prompted

### 3. Answer Questions
- Wait for the question to appear
- Recording starts automatically
- Speak your answer clearly
- Click "Stop Recording" when done
- Click "Next Question" to proceed

### 4. End Interview
- Click "End Interview" button
- Confirm to finish

### 5. View Feedback
- Wait for AI analysis (may take 1-2 minutes)
- Review your answers
- See feedback for each question
- View AI-improved answers in STAR format
- Download complete report

## Features

✅ **5 Interview Personas**
- HR (Behavioral & Cultural Fit)
- Technical Lead (Technical Depth)
- Senior Manager (Leadership)
- Executive/CEO (Strategic Vision)

✅ **3 Difficulty Levels**
- Easy (Entry to Mid-level)
- Medium (Mid to Senior)
- Hard (Senior to Principal)

✅ **Real-time Recording**
- Camera and microphone access
- Live video preview
- Audio transcription

✅ **AI-Powered Feedback**
- Detailed analysis
- Strengths identification
- Improvement suggestions
- STAR-formatted answers

## Troubleshooting

### Services Not Starting?
1. Make sure all dependencies are installed:
   ```powershell
   cd backend
   npm install
   pip install -r requirements.txt
   
   cd ../frontend
   npm install
   ```

### Camera/Microphone Not Working?
- Check browser permissions
- Use Chrome, Edge, or Firefox
- Make sure other apps aren't using them

### Ollama Errors?
```powershell
ollama pull llama3
ollama serve
```

### Python Errors?
```powershell
cd backend
python interview_api.py
```
Look for error messages and ensure all packages are installed.

## Stopping the Application

Close all 4 PowerShell windows that were opened.

Or press `Ctrl+C` in each terminal window.

## Need Help?

Check the detailed [SETUP_GUIDE.md](./SETUP_GUIDE.md) for more information.

---

**Enjoy practicing your interviews! 🎯**
