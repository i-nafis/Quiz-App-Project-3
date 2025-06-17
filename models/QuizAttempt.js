// models/QuizAttempt.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

// Sub‐schema for each answered question:
const questionDetailSchema = new Schema({
  questionText:  { type: String, required: true },
  options:       { type: [String], required: true },
  userAnswer:    { type: String, required: true },
  correctAnswer: { type: String, required: true },
  isCorrect:     { type: Boolean, required: true }
}, { _id: false });

const quizAttemptSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  questions: {
    type: [questionDetailSchema],
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  mode: {
    type: Number,
    required: true     // how many questions were in this quiz
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
});

// index to fetch a user’s attempts quickly in reverse chronological order
quizAttemptSchema.index({ user: 1, submittedAt: -1 });

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);
