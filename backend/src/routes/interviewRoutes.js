import express from 'express';
import axios from 'axios';
import multer from 'multer';
import FormData from 'form-data';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8000';

// Start interview and get questions
router.post('/start', async (req, res) => {
  try {
    const { persona, difficulty, num_questions = 5 } = req.body;

    const response = await axios.post(`${PYTHON_API_URL}/interview/start`, {
      persona,
      difficulty,
      num_questions
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error starting interview:', error.message);
    res.status(500).json({ 
      error: 'Failed to start interview',
      message: error.response?.data?.detail || error.message
    });
  }
});

// Transcribe audio
router.post('/transcribe', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const formData = new FormData();
    formData.append('file', req.file.buffer, {
      filename: 'audio.wav',
      contentType: 'audio/wav'
    });

    const response = await axios.post(
      `${PYTHON_API_URL}/interview/transcribe`,
      formData,
      {
        headers: formData.getHeaders()
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Error transcribing audio:', error.message);
    res.status(500).json({ 
      error: 'Failed to transcribe audio',
      message: error.response?.data?.detail || error.message
    });
  }
});

// Analyze answer
router.post('/analyze', async (req, res) => {
  try {
    const { question, answer, persona } = req.body;

    const response = await axios.post(`${PYTHON_API_URL}/interview/analyze`, {
      question,
      answer,
      persona
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error analyzing answer:', error.message);
    res.status(500).json({ 
      error: 'Failed to analyze answer',
      message: error.response?.data?.detail || error.message
    });
  }
});

export default router;
