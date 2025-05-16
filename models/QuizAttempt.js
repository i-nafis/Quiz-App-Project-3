// models/QuizAttempt.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const quizAttemptSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
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
    score: {
        type: Number,
        required: true
    },
    submittedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema); // Make sure you are exporting