// routes/quiz.js
// -------------------------------------
// Defines quiz-related routes: quiz page, submission, and score submission.
// Uses real controller logic from controllers/quizController.js.
// -------------------------------------

const express = require('express');
const router = express.Router();

// ✅ Load actual controller logic
const quizController = require('../controllers/quizController');

// ✅ GET /quiz - Render quiz page with 10 random questions
router.get('/', quizController.showQuiz);

// ✅ POST /quiz/submit - Process EJS form quiz submission
router.post('/submit', quizController.processQuiz);

// ✅ POST /quiz/submit-json - Handle fetch() or frontend JS submissions
router.post('/submit-json', quizController.submitScore);

module.exports = router;
