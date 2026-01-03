import mongoose from 'mongoose';

const interviewSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    persona: {
      type: String,
      required: true,
      enum: ['HR', 'Technical Lead', 'Senior Manager', 'Executive/CEO'],
    },
    difficulty: {
      type: String,
      required: true,
      enum: ['easy', 'medium', 'hard'],
    },
    questions: [
      {
        question_id: Number,
        question: String,
      },
    ],
    responses: [
      {
        question_id: Number,
        question: String,
        answer: String,
        transcription: String,
        analysis: {
          analysis: String,
          improved_answer: String,
        },
      },
    ],
    score: {
      type: Number,
      min: 0,
      max: 100,
    },
    communicationScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    confidenceScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    duration: {
      type: Number, // in seconds
    },
    status: {
      type: String,
      enum: ['in_progress', 'completed', 'abandoned'],
      default: 'in_progress',
    },
  },
  {
    timestamps: true,
  }
);

// Add index for faster queries
interviewSessionSchema.index({ userId: 1, createdAt: -1 });

const InterviewSession = mongoose.model('InterviewSession', interviewSessionSchema);

export default InterviewSession;
