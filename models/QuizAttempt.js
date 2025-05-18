// ✅ Updated QuizAttempt.js to use string user ID (not ObjectId)
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const QuizAttemptSchema = new mongoose.Schema({
    user: {
      type: String, // store user._id as string from users.json
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