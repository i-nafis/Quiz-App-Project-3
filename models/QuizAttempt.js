// ✅ Fixed models/QuizAttempt.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const quizAttemptSchema = new Schema({
  user: {
    type: String, // username instead of ObjectId
    required: true
  },
  questions: [{
    questionText: String,
    options: [String],
    userAnswer: String,
    correctAnswer: String,
    isCorrect: Boolean
  }],
  score: {
    type: Number,
    required: true
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);