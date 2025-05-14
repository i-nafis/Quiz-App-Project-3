const mongoose = require('mongoose');

// Define schema for quiz question
const quizSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true,
    },
    correct_answer: {
        type: String,
        required: true,
    },
    incorrect_answers: {
        type: [String], // Array of incorrect answers
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    difficulty: {
        type: String,
        required: true,
    }
});

// Create Quiz model from the schema
const Quiz = mongoose.model('Quiz', quizSchema);

module.exports = Quiz;