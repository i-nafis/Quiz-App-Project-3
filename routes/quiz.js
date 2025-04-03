// routes/quiz.js

const express = require('express');
const router = express.Router();

// Make sure this path is correct relative to your project structure.
const quizController = require('../controllers/quizController');

// Register the GET and POST routes using the controller functions.
router.get('/', quizController.startQuiz);
router.post('/submit', quizController.submitAnswer);

module.exports = router;
