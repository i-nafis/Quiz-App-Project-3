// routes/quiz.js
// -------------------------------------
// Defines quiz-related routes: quiz page, submission, and score submission.
// Uses real controller logic from controllers/quizController.js.
// -------------------------------------

const express = require('express');
const router = express.Router();
const fs = require('fs'); // New require statement

// ✅ Load actual controller logic
const quizController = require('../controllers/quizController');

// ✅ GET /quiz - Render quiz page with 10 random questions
router.get('/', quizController.showQuiz);

// ✅ POST /quiz/submit - Process EJS form quiz submission
router.post('/submit', quizController.processQuiz);

// ✅ POST /quiz/submit-json - Handle fetch() or frontend JS submissions
router.post('/submit-json', quizController.submitScore);

// ✅ POST /quiz/start - Start quiz with custom number of questions
router.post('/start', (req, res) => {
  const numQuestions = parseInt(req.body.numQuestions) || 10;

  const allQuestions = JSON.parse(fs.readFileSync('./data/questions.json'));
  const shuffled = allQuestions.sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, numQuestions);

  res.render('quiz', { title: 'Quiz Time!', questions: selected });
});

module.exports = router;
