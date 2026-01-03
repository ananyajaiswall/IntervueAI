import express from 'express';
import InterviewSession from '../models/InterviewSession.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/sessions
// @desc    Create a new interview session
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { persona, difficulty, questions } = req.body;

    const session = await InterviewSession.create({
      userId: req.user._id,
      persona,
      difficulty,
      questions,
      status: 'in_progress',
    });

    res.status(201).json({
      success: true,
      data: session,
    });
  } catch (error) {
    console.error('Error creating interview session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create interview session',
      error: error.message,
    });
  }
});

// @route   PUT /api/sessions/:id
// @desc    Update interview session with responses and feedback
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const { responses, score, communicationScore, confidenceScore, duration, status } = req.body;

    const session = await InterviewSession.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Interview session not found',
      });
    }

    session.responses = responses || session.responses;
    session.score = score !== undefined ? score : session.score;
    session.communicationScore = communicationScore !== undefined ? communicationScore : session.communicationScore;
    session.confidenceScore = confidenceScore !== undefined ? confidenceScore : session.confidenceScore;
    session.duration = duration !== undefined ? duration : session.duration;
    session.status = status || session.status;

    await session.save();

    res.json({
      success: true,
      data: session,
    });
  } catch (error) {
    console.error('Error updating interview session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update interview session',
      error: error.message,
    });
  }
});

// @route   GET /api/sessions
// @desc    Get all completed interview sessions for the logged-in user
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const sessions = await InterviewSession.find({
      userId: req.user._id,
      status: 'completed',
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('persona difficulty score createdAt');

    res.json({
      success: true,
      count: sessions.length,
      data: sessions,
    });
  } catch (error) {
    console.error('Error fetching interview sessions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch interview sessions',
      error: error.message,
    });
  }
});

// @route   GET /api/sessions/:id
// @desc    Get a specific interview session
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const session = await InterviewSession.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Interview session not found',
      });
    }

    res.json({
      success: true,
      data: session,
    });
  } catch (error) {
    console.error('Error fetching interview session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch interview session',
      error: error.message,
    });
  }
});

// @route   GET /api/sessions/stats/count
// @desc    Get total session count for the logged-in user
// @access  Private
router.get('/stats/count', protect, async (req, res) => {
  try {
    const totalSessions = await InterviewSession.countDocuments({
      userId: req.user._id,
      status: 'completed',
    });

    // Calculate average communication and confidence scores
    const sessions = await InterviewSession.find({
      userId: req.user._id,
      status: 'completed',
    }).select('communicationScore confidenceScore');

    let avgCommunication = 0;
    let avgConfidence = 0;
    let validCommunicationCount = 0;
    let validConfidenceCount = 0;

    sessions.forEach((session) => {
      if (session.communicationScore !== undefined && session.communicationScore !== null) {
        avgCommunication += session.communicationScore;
        validCommunicationCount++;
      }
      if (session.confidenceScore !== undefined && session.confidenceScore !== null) {
        avgConfidence += session.confidenceScore;
        validConfidenceCount++;
      }
    });

    avgCommunication = validCommunicationCount > 0 ? Math.round(avgCommunication / validCommunicationCount) : 0;
    avgConfidence = validConfidenceCount > 0 ? Math.round(avgConfidence / validConfidenceCount) : 0;

    res.json({
      success: true,
      data: {
        totalSessions,
        avgCommunication,
        avgConfidence,
      },
    });
  } catch (error) {
    console.error('Error fetching session count:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch session count',
      error: error.message,
    });
  }
});

export default router;
