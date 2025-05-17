// ✅ Fixed models/QuizAttempt.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const QuizAttemptSchema = new mongoose.Schema({
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    questions: [{
      questionText: String,
      options: [String],
      userAnswer: String,
      correctAnswer: String,
      isCorrect: Boolean
    }],
    score: Number,
    submittedAt: {
      type: Date,
      default: Date.now
    }
  });

module.exports = mongoose.model('QuizAttempt', QuizAttemptSchema); 