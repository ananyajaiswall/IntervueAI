# IntervueAI — AI-Powered Interview Practice Platform

IntervueAI is a full-stack AI-powered interview simulation platform designed to help users improve their communication, confidence, and interview performance. Users can choose interview personas, answer real questions, receive AI-based feedback, and track progress over time.

## ⭐ Key Features
- Real-time audio recording & transcription
- AI-generated interview questions (persona + difficulty)
- Speech-to-text using Whisper
- AI analysis for communication & confidence
- Dashboard with aggregated insights
- PDF report generation
- Session history & performance tracking
- JWT authentication & secure login
- Responsive UI 


## 🧠 Tech Stack

### Frontend
- React 18 + TypeScript
- Vite
- Tailwind CSS + shadcn/ui
- React Router v6
- Axios
- jsPDF

### Backend (Node.js)
- Node.js + Express
- MongoDB + Mongoose
- JWT (Auth)
- bcryptjs
- express-validator

### AI Microservices (Python)
- FastAPI
- Whisper (Speech-to-text)
- Llama3 / Ollama (LLM feedback & analysis)
- requests library

### Database
- MongoDB Atlas

## 🧪 How It Works (Flow)
1. User logs in / signs up
2. Chooses persona + difficulty
3. AI interview simulation begins
4. Audio recorded + transcribed using Whisper
5. LLM analyzes answers for clarity, relevance & communication
6. Scores & feedback shown on dashboard
7. PDF report generated
8. Average confidence & communication tracked over sessions

## 🛠 Setup Instructions

### 1. Clone Repo
```bash
git clone https://github.com/ananyajaiswall/IntervueAI
cd IntervueAI
````

---

## 🗄 Backend Setup (Node.js)

```bash
cd backend
npm install
```

Create `.env` file:

```
PORT=5000
MONGO_URI=<your mongodb atlas uri>
JWT_SECRET=<your secret>
```

Run:

```bash
npm start
```

---

## 🤖 AI Microservice Setup (Python)

```bash
cd ../python_api
python -m venv .venv
source .venv/bin/activate     # (Mac/Linux)
.\.venv\Scripts\activate      # (Windows)
pip install -r requirements.txt
```

Run:

```bash
python interview_api.py
```

---

## 🎨 Frontend Setup (React)

```bash
cd ../frontend
npm install
npm run dev
```

---

## 🚧 Future Enhancements

* Body language detection (CV + Vision Transformers)
* Real-time corrective suggestions
* HR/Tech persona marketplace
* Job role-specific interview templates
* Adaptive difficulty

---

## 📌 Purpose of the Project

Designed as an interview preparation tool for:

* Students & freshers
* Job switchers
* Mock interview practice
* Communication improvement

---

