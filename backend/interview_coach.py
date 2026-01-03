import os
import wave
import pyaudio
import threading
import whisper
import requests
import json
import random
import time

# Load Whisper model (only once at startup)
print("Loading Whisper model... (this may take a minute the first time)")
whisper_model = whisper.load_model("base")  # Options: tiny, base, small, medium, large
print("✅ Whisper model loaded!")

# Multi-Persona Interview Question Bank for Top MNCs (FAANG Style)
# Organized by Persona Type and Difficulty Level

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

class InterviewAnalyzer:
    def __init__(self):
        self.chunk = 1024
        self.format = pyaudio.paInt16
        self.channels = 1
        self.rate = 44100
        self.frames = []
        self.is_recording = False
        self.p = pyaudio.PyAudio()

    def record_audio(self, filename="response.wav", auto_start=True):
        """Records audio from the mic until the user hits Enter."""
        self.frames = []
        self.is_recording = True
        
        stream = self.p.open(format=self.format,
                             channels=self.channels,
                             rate=self.rate,
                             input=True,
                             frames_per_buffer=self.chunk)

        if auto_start:
            print("\n🔴 Recording started automatically... (Press Enter to stop)")
        else:
            print("\n🔴 Recording... (Press Enter to stop)")

        # Start a background thread to listen for user input to stop recording
        def input_thread():
            input()
            self.is_recording = False

        threading.Thread(target=input_thread).start()

        while self.is_recording:
            data = stream.read(self.chunk)
            self.frames.append(data)

        print("⏹️ Recording stopped.")

        stream.stop_stream()
        stream.close()

        # Save the audio file
        wf = wave.open(filename, 'wb')
        wf.setnchannels(self.channels)
        wf.setsampwidth(self.p.get_sample_size(self.format))
        wf.setframerate(self.rate)
        wf.writeframes(b''.join(self.frames))
        wf.close()
        
        return filename

    def transcribe_audio(self, filename):
        """Converts audio to text using local Whisper model."""
        print("📝 Transcribing audio...")
        result = whisper_model.transcribe(filename)
        return result["text"]

    def improve_answer(self, question, answer_text, persona):
        """Generates an improved STAR-formatted version of the answer tailored to persona."""
        print("✨ Generating improved answer...")
        
        if not answer_text.strip():
            return "No answer to improve."
        
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
ORIGINAL ANSWER: "{answer_text}"

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

    def analyze_response(self, question, answer_text, persona):
        """Analyzes answer and provides strengths and improvement areas based on persona."""
        print("🧠 Analyzing response...")
        
        if not answer_text.strip():
            return "⚠️ No audio detected. Please speak your answer when recording."
        
        persona_context = {
            'HR': 'an expert HR interviewer at a top FAANG company evaluating cultural fit, soft skills, and behavioral competencies',
            'Technical Lead': 'a senior Technical Lead at a top FAANG company evaluating technical depth, problem-solving, and engineering excellence',
            'Senior Manager': 'a Senior Engineering Manager at a top FAANG company evaluating leadership, people management, and strategic thinking',
            'Executive/CEO': 'a C-level executive at a top FAANG company evaluating strategic vision, organizational impact, and executive presence'
        }
        
        prompt = f"""You are {persona_context[persona]}.

INTERVIEW QUESTION: "{question}"
CANDIDATE ANSWER: "{answer_text}"

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
                return f"❌ Error: Ollama returned status {response.status_code}. Make sure Ollama is running with 'ollama serve'."
        except requests.exceptions.ConnectionError:
            return "❌ Cannot connect to Ollama. Please install and run Ollama first.\n\nInstall from: https://ollama.com/download\nThen run: ollama run llama3"
        except Exception as e:
            return f"❌ Error during analysis: {str(e)}"

# --- Main Execution Flow ---
if __name__ == "__main__":
    analyzer = InterviewAnalyzer()
    
    print("\n" + "="*70)
    print("🎯 FAANG INTERVIEW COACH - SOFTWARE DEVELOPMENT ENGINEER")
    print("    Microsoft | Google | Amazon | Meta | Apple")
    print("="*70)
    
    # Persona Selection
    print("\n📋 SELECT INTERVIEW PERSONA:")
    print("1. HR (Behavioral & Cultural Fit)")
    print("2. Technical Lead (Technical Depth & Problem Solving)")
    print("3. Senior Manager (Leadership & People Management)")
    print("4. Executive/CEO (Strategic Vision & Organizational Impact)")
    
    persona_map = {
        '1': 'HR',
        '2': 'Technical Lead',
        '3': 'Senior Manager',
        '4': 'Executive/CEO'
    }
    
    persona_choice = input("\nEnter your choice (1-4): ").strip()
    persona = persona_map.get(persona_choice, 'HR')
    
    # Difficulty Selection
    print(f"\n🎚️ SELECT DIFFICULTY LEVEL:")
    print("1. Easy (Entry-level to Mid-level)")
    print("2. Medium (Mid-level to Senior)")
    print("3. Hard (Senior to Principal/Staff)")
    
    difficulty_map = {
        '1': 'easy',
        '2': 'medium',
        '3': 'hard'
    }
    
    difficulty_choice = input("\nEnter your choice (1-3): ").strip()
    difficulty = difficulty_map.get(difficulty_choice, 'medium')
    
    # Default to 5 questions per session
    num_questions = 5
    total_questions_answered = 0
    
    # Display session info
    print("\n" + "="*70)
    print(f"📊 SESSION CONFIGURATION")
    print("="*70)
    print(f"Persona: {persona}")
    print(f"Difficulty: {difficulty.upper()}")
    print(f"Questions per round: {num_questions}")
    print("="*70)
    
    input("\nPress Enter to begin the interview... ")
    
    # Continuous session loop
    continue_interview = True
    round_number = 1
    
    while continue_interview:
        # Select questions from the chosen persona and difficulty
        available_questions = INTERVIEW_QUESTIONS[persona][difficulty]
        num_to_select = min(num_questions, len(available_questions))
        questions = random.sample(available_questions, num_to_select)
        
        print("\n" + "="*70)
        print(f"🎯 ROUND {round_number} - {len(questions)} Questions")
        print("="*70)
        
        # Phase 1: Ask all questions and collect responses
        responses = []
        
        for idx, question in enumerate(questions, 1):
            print("\n\n" + "="*70)
            print(f"📋 QUESTION {idx} of {len(questions)} | ROUND {round_number} | {persona} | {difficulty.upper()}")
            print("="*70)
            print(f"\n💼 {question}\n")
            print("="*70)
            
            # Auto-start recording after brief pause
            time.sleep(1.5)
            
            # Record the answer (auto-starts)
            audio_file = analyzer.record_audio(f"response_r{round_number}_q{idx}.wav", auto_start=True)
            
            # Transcribe
            text_response = analyzer.transcribe_audio(audio_file)
            print(f"\n{'─'*70}")
            print("📄 YOUR TRANSCRIPT:")
            print('─'*70)
            print(f"{text_response}")
            print('─'*70)
            
            # Store question and response for later analysis
            responses.append({
                'question': question,
                'answer': text_response,
                'number': idx
            })
            
            # Continue to next question (no analysis yet)
            if idx < len(questions):
                print("\n")
                cont = input("Press Enter for next question (or type 'q' to skip remaining questions): ").strip().lower()
                if cont == 'q':
                    break
        
        # Phase 2: Analyze all responses in order
        print("\n\n" + "="*70)
        print("📊 ANALYSIS PHASE - Analyzing All Responses")
        print("="*70)
        print("\nPlease wait while we analyze your answers...\n")
        
        for response_data in responses:
            idx = response_data['number']
            question = response_data['question']
            text_response = response_data['answer']
            
            print("\n" + "="*70)
            print(f"📊 ANALYSIS FOR QUESTION {idx}")
            print("="*70)
            print(f"\nQuestion: {question}")
            print(f"\nYour Answer: {text_response}")
            print("\n" + "─"*70)
            
            # Analyze (persona-aware)
            feedback = analyzer.analyze_response(question, text_response, persona)
            print(f"\n📊 FEEDBACK SUMMARY ({persona} Perspective):")
            print('─'*70)
            print(f"{feedback}")
            print('─'*70)
            
            # Generate improved answer (persona-aware)
            improved = analyzer.improve_answer(question, text_response, persona)
            print(f"\n✨ ANSWER IMPROVER:")
            print('─'*70)
            print(f"{improved}")
            print('─'*70)
            
            if idx < len(responses):
                input("\nPress Enter to see analysis for next question...")
        
        total_questions_answered += len(responses)
        
        # Ask if user wants to continue with another round
        print("\n" + "="*70)
        print(f"✅ ROUND {round_number} COMPLETE!")
        print("="*70)
        print(f"Questions completed this round: {len(responses)}")
        print(f"Total questions completed: {total_questions_answered}")
        print("="*70)
        
        continue_choice = input("\nDo you want to continue with another 5 questions? (y/n): ").strip().lower()
        
        if continue_choice == 'y' or continue_choice == 'yes':
            round_number += 1
            print("\n🚀 Starting next round...")
            time.sleep(1)
        else:
            continue_interview = False
    
    print("\n" + "="*70)
    print("✅ INTERVIEW PRACTICE SESSION COMPLETE!")
    print("="*70)
    print(f"\n📈 Session Summary:")
    print(f"   Persona: {persona}")
    print(f"   Difficulty: {difficulty.upper()}")
    print(f"   Total Rounds: {round_number}")
    print(f"   Total Questions Completed: {total_questions_answered}")
    print("\n💡 Keep practicing to master FAANG interviews!")
    print("="*70 + "\n")