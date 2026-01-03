from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import whisper
import requests
import random
import os
import tempfile
from typing import List, Optional

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://localhost:8080", "http://localhost:8081"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Whisper model
print("Loading Whisper model...")
whisper_model = whisper.load_model("base")
print("✅ Whisper model loaded!")

# Multi-Persona Interview Question Bank
INTERVIEW_QUESTIONS = {
    'HR': {
        'easy': [
            "Tell me about yourself and walk me through your resume.",
            "Why do you want to work at our company specifically?",
            "What are your greatest strengths and how do they apply to this role?",
            "What is your biggest weakness and how are you working to improve it?",
            "Where do you see yourself in 5 years?",
            "Why are you looking to leave your current position?",
            "What motivates you in your work as a software engineer?",
            "Describe your ideal work environment and team culture.",
        ],
        'medium': [
            "Tell me about a time when you received constructive criticism. How did you respond?",
            "Describe a situation where you had to work with a difficult colleague.",
            "Give an example of when you went above and beyond your job responsibilities.",
            "Tell me about a time you had to meet a tight deadline under pressure.",
            "Describe a situation where you had to adapt to significant changes at work.",
            "How do you handle work-life balance, especially during high-pressure periods?",
            "Tell me about a time when you disagreed with a team decision. What did you do?",
            "Describe your experience working with diverse or cross-functional teams.",
        ],
        'hard': [
            "Tell me about a time when you failed at something significant. What did you learn?",
            "Describe a situation where you had a major conflict with your manager and how you resolved it.",
            "Give me an example of when you had to make an ethical decision at work.",
            "Tell me about a time when you had to deliver bad news to stakeholders.",
            "Describe a situation where you had to choose between two equally important priorities.",
            "How would you handle discovering a serious mistake made by a senior colleague?",
            "Tell me about the most difficult professional relationship you've had to manage.",
            "Describe a time when you had to advocate for yourself or your team in a challenging situation.",
        ]
    },
    'Technical Lead': {
        'easy': [
            "What programming languages and technologies are you most proficient in?",
            "Describe your experience with version control systems like Git.",
            "How do you approach learning new technologies or frameworks?",
            "What development methodologies have you worked with (Agile, Scrum, etc.)?",
            "Tell me about a technical project you're particularly proud of.",
            "How do you ensure code quality in your projects?",
            "What's your experience with testing (unit, integration, end-to-end)?",
            "Describe your approach to documenting code and technical decisions.",
        ],
        'medium': [
            "Tell me about a time when you had to debug a complex production issue.",
            "Describe a situation where you had to optimize application performance.",
            "How would you approach migrating a legacy system to modern technology?",
            "Tell me about a time when you had to make a critical technical decision with incomplete information.",
            "Describe your experience mentoring junior developers or conducting code reviews.",
            "Give an example of when you had to refactor a significant portion of a codebase.",
            "How do you handle technical debt in your projects?",
            "Tell me about a time when you introduced a new technology or tool to your team.",
        ],
        'hard': [
            "Describe how you would design a distributed system for handling millions of users.",
            "Tell me about a time when you had to make a trade-off between technical excellence and business needs.",
            "How would you approach scaling an application that's experiencing exponential growth?",
            "Describe a situation where you had to resolve a major architectural disagreement in your team.",
            "Tell me about the most complex technical problem you've solved in your career.",
            "How would you design the backend infrastructure for a service like Uber or Netflix?",
            "Describe your experience with microservices architecture and when you'd choose monolith vs microservices.",
            "Tell me about a time when you had to balance multiple critical production issues simultaneously.",
        ]
    },
    'Senior Manager': {
        'easy': [
            "What's your management philosophy and leadership style?",
            "How do you motivate and engage your team members?",
            "Describe your experience managing software development teams.",
            "How do you approach setting goals and expectations for your team?",
            "What metrics do you use to measure team success?",
            "How do you handle one-on-one meetings with your direct reports?",
            "Describe your approach to hiring and building a strong team.",
            "How do you stay technical while managing people and projects?",
        ],
        'medium': [
            "Tell me about a time when you had to manage a underperforming team member.",
            "Describe a situation where you had to lead a team through a major organizational change.",
            "How do you handle conflicts between team members?",
            "Tell me about a time when you had to make an unpopular decision for the good of the team.",
            "Describe how you've built and scaled a team from scratch.",
            "Give an example of when you had to balance technical debt against new feature development.",
            "Tell me about a time when you had to manage up and influence senior leadership.",
            "How do you handle resource constraints while maintaining team morale?",
        ],
        'hard': [
            "Describe a time when you had to let someone go. How did you handle it?",
            "Tell me about a situation where multiple projects were failing simultaneously. How did you prioritize?",
            "How would you handle a situation where your team is consistently missing deadlines?",
            "Describe your experience managing a team through a failed product launch or major incident.",
            "Tell me about a time when you had to rebuild trust in a dysfunctional team.",
            "How do you balance the needs of the business, your team, and individual career growth?",
            "Describe a situation where you had to make a strategic decision that affected multiple teams.",
            "Tell me about your experience managing distributed or remote teams across time zones.",
        ]
    },
    'Executive/CEO': {
        'easy': [
            "What's your vision for the engineering organization in the next 2-3 years?",
            "How do you align technical strategy with overall business objectives?",
            "Describe your experience working with C-level executives and board members.",
            "What's your approach to building and scaling engineering culture?",
            "How do you think about innovation versus operational excellence?",
            "What key metrics do you track to understand organizational health?",
            "Describe your philosophy on build vs buy vs partner decisions.",
            "How do you approach technology roadmap planning at scale?",
        ],
        'medium': [
            "Tell me about a time when you had to make a major strategic pivot.",
            "Describe how you've built relationships with product, design, and business stakeholders.",
            "How do you approach budget planning and resource allocation across multiple teams?",
            "Tell me about your experience driving digital transformation in an organization.",
            "Describe a situation where you had to balance short-term pressures with long-term vision.",
            "How do you evaluate and manage risk in large-scale technical initiatives?",
            "Tell me about a time when you had to influence the board or CEO on a critical technical decision.",
            "Describe your approach to talent acquisition and retention at scale.",
        ],
        'hard': [
            "Tell me about a time when you led an organization through a crisis or major failure.",
            "Describe a situation where you had to restructure an entire engineering organization.",
            "How would you handle a scenario where the company is losing market share due to technical debt?",
            "Tell me about your experience navigating M&A from a technology integration perspective.",
            "Describe a time when you had to make a decision that significantly impacted hundreds of employees.",
            "How do you balance innovation investment with maintaining legacy systems that drive revenue?",
            "Tell me about a situation where you had to defend your technical strategy to skeptical investors.",
            "Describe your experience building engineering organizations from 10 to 100+ engineers.",
        ]
    }
}

# Pydantic Models
class InterviewConfig(BaseModel):
    persona: str
    difficulty: str
    num_questions: int = 5

class QuestionResponse(BaseModel):
    question_id: int
    question: str

class TranscriptionRequest(BaseModel):
    audio_data: str  # base64 encoded audio

class AnalysisRequest(BaseModel):
    question: str
    answer: str
    persona: str

class FeedbackResponse(BaseModel):
    analysis: str
    improved_answer: str

# API Endpoints
@app.get("/")
def root():
    return {"message": "Interview Coach API", "status": "running"}

@app.post("/interview/start")
def start_interview(config: InterviewConfig):
    """Get interview questions based on persona and difficulty"""
    try:
        persona = config.persona
        difficulty = config.difficulty.lower()
        num_questions = config.num_questions
        
        if persona not in INTERVIEW_QUESTIONS:
            raise HTTPException(status_code=400, detail="Invalid persona")
        
        if difficulty not in INTERVIEW_QUESTIONS[persona]:
            raise HTTPException(status_code=400, detail="Invalid difficulty")
        
        available_questions = INTERVIEW_QUESTIONS[persona][difficulty]
        num_to_select = min(num_questions, len(available_questions))
        selected_questions = random.sample(available_questions, num_to_select)
        
        questions = [
            {"question_id": idx, "question": q}
            for idx, q in enumerate(selected_questions, 1)
        ]
        
        return {
            "session_id": f"{persona}_{difficulty}_{num_questions}",
            "persona": persona,
            "difficulty": difficulty,
            "questions": questions
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/interview/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    """Transcribe audio file to text using Whisper"""
    try:
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_file:
            content = await file.read()
            temp_file.write(content)
            temp_file_path = temp_file.name
        
        # Transcribe using Whisper
        result = whisper_model.transcribe(temp_file_path)
        
        # Clean up temp file
        os.unlink(temp_file_path)
        
        return {
            "transcription": result["text"],
            "language": result.get("language", "en")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")

@app.post("/interview/analyze")
def analyze_answer(request: AnalysisRequest):
    """Analyze answer and provide feedback"""
    try:
        question = request.question
        answer = request.answer
        persona = request.persona
        
        if not answer.strip():
            return {
                "analysis": "⚠️ No answer detected. Please provide your response.",
                "improved_answer": "No answer to improve."
            }
        
        # Get analysis
        analysis = get_analysis(question, answer, persona)
        
        # Get improved answer
        improved = get_improved_answer(question, answer, persona)
        
        return {
            "analysis": analysis,
            "improved_answer": improved
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

def get_analysis(question: str, answer: str, persona: str) -> str:
    """Get feedback analysis from Ollama"""
    persona_context = {
        'HR': 'an expert HR interviewer at a top FAANG company evaluating cultural fit, soft skills, and behavioral competencies',
        'Technical Lead': 'a senior Technical Lead at a top FAANG company evaluating technical depth, problem-solving, and engineering excellence',
        'Senior Manager': 'a Senior Engineering Manager at a top FAANG company evaluating leadership, people management, and strategic thinking',
        'Executive/CEO': 'a C-level executive at a top FAANG company evaluating strategic vision, organizational impact, and executive presence'
    }
    
    prompt = f"""You are {persona_context[persona]}.

INTERVIEW QUESTION: "{question}"
CANDIDATE ANSWER: "{answer}"

Provide ONLY:

**Strengths:**
[Bullet points of what they did well - be specific]

**Areas for Improvement:**
[Bullet points of what needs work - be specific and actionable]

Keep it concise and direct. No scores, no extra commentary."""

    try:
        response = requests.post(
            'http://localhost:11434/api/generate',
            json={
                "model": "llama3",
                "prompt": prompt,
                "stream": False
            },
            timeout=60
        )
        
        if response.status_code == 200:
            return response.json()['response']
        else:
            return "❌ Error generating analysis. Please ensure Ollama is running."
    except Exception as e:
        return f"❌ Error: {str(e)}"

def get_improved_answer(question: str, answer: str, persona: str) -> str:
    """Get improved STAR-formatted answer from Ollama"""
    persona_focus = {
        'HR': 'Focus on behavioral aspects, cultural fit, and interpersonal skills.',
        'Technical Lead': 'Focus on technical details, problem-solving approach, and engineering decisions.',
        'Senior Manager': 'Focus on leadership, team management, and strategic decision-making.',
        'Executive/CEO': 'Focus on strategic vision, organizational impact, and business outcomes.'
    }
    
    prompt = f"""You are an expert interview coach for FAANG companies. Take the candidate's answer and rewrite it in a professional STAR format.

INTERVIEW CONTEXT: {persona} interview
{persona_focus[persona]}

INTERVIEW QUESTION: "{question}"
ORIGINAL ANSWER: "{answer}"

Rewrite the answer in this EXACT format:

**Situation:** [Set clear context - where, when, what was happening]

**Task:** [Define the specific challenge or responsibility]

**Action:** [Explain concrete steps taken, using "I" not "we"]

**Result:** [Quantifiable outcomes and impact with metrics]

Make it professional, concise, and compelling. Add realistic metrics if missing. Keep it under 150 words total."""

    try:
        response = requests.post(
            'http://localhost:11434/api/generate',
            json={
                "model": "llama3",
                "prompt": prompt,
                "stream": False
            },
            timeout=60
        )
        
        if response.status_code == 200:
            return response.json()['response']
        else:
            return "Error generating improved answer."
    except Exception as e:
        return f"Error: {str(e)}"

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
